"""Reproducibly convert the official BodyParts3D 4.0 OBJ archives to layer GLBs.

Run with Python 3.11+ and NumPy. No Blender, web scraping, or external converter
is needed. Source geometry is rotated and uniformly scaled, never fabricated.
"""
from __future__ import annotations

import csv
import hashlib
import json
import re
import struct
import zipfile
from collections import defaultdict
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "assets/source/bodyparts3d"
OUTPUT = ROOT / "public/models/bodyparts3d"
SOURCE_URL = "https://dbarchive.biosciencedbc.jp/en/bodyparts3d/download.html"


def rows(name):
    with (SOURCE / name).open(encoding="utf-8-sig") as file:
        return list(csv.reader(file, delimiter="\t"))[1:]


labels = {r[0]: r[2] for r in rows("isa-parts.tsv")}
labels.update({r[0]: r[2] for r in rows("parts.tsv")})
elements = defaultdict(list)
for filename in ("isa-elements.tsv", "elements.tsv"):
    local = defaultdict(list)
    for identifier, _name, element in rows(filename):
        local[identifier].append(element)
    elements.update(local)
children = defaultdict(list)
parents = defaultdict(list)
part_children = defaultdict(list)
for parent, _pname, child, _cname in rows("isa-relations.tsv"):
    children[parent].append(child)
for parent, _pname, child, _cname in rows("relations.tsv"):
    parents[child].append(parent)
    part_children[parent].append(child)


def descendants(identifier):
    found = {identifier}
    for child in children[identifier]:
        found.update(descendants(child))
    return found


def leaves(root):
    return sorted(i for i in descendants(root) if not children[i] and elements[i])


def regional_leaves(root):
    if not part_children[root]:
        return [root] if elements[root] else []
    return [item for child in part_children[root] for item in regional_leaves(child)]


archives = [zipfile.ZipFile(SOURCE / filename) for filename in ("isa-models.zip", "models.zip")]
files = {}
for archive in archives:
    for name in archive.namelist():
        if name.endswith(".obj"):
            files[Path(name).stem] = (archive, name)


def read_obj(identifier):
    archive, filename = files[identifier]
    vertices, normals, faces = [], [], []
    for line in archive.read(filename).decode("utf-8").splitlines():
        if line.startswith("v "):
            vertices.append([float(v) for v in line.split()[1:4]])
        elif line.startswith("vn "):
            normals.append([float(v) for v in line.split()[1:4]])
        elif line.startswith("f "):
            parts = [token.split("/") for token in line.split()[1:]]
            # This official release uses one normal per position. Fail loudly
            # on a source-format change instead of silently corrupting meshes.
            assert all(len(p) == 3 and p[0] == p[2] for p in parts), filename
            polygon = [int(p[0]) - 1 for p in parts]
            faces.extend((polygon[0], polygon[i], polygon[i + 1]) for i in range(1, len(polygon) - 1))
    positions = np.asarray(vertices, dtype=np.float32)
    normals = np.asarray(normals, dtype=np.float32)
    indices = np.asarray(faces, dtype=np.uint32).reshape(-1)
    assert positions.shape == normals.shape and indices.max() < len(positions), filename
    assert np.isfinite(positions).all() and np.isfinite(normals).all(), filename
    return positions, normals, indices


skin_positions, _, _ = read_obj("FJ2810")
minimum, maximum = skin_positions.min(axis=0), skin_positions.max(axis=0)
center = (minimum + maximum) / 2
scale = 5.6 / float(maximum[2] - minimum[2])


def transformed(identifier):
    positions, normals, indices = read_obj(identifier)
    positions = (positions - center) * scale
    positions = positions[:, [0, 2, 1]].copy()
    positions[:, 1] += 0.15
    positions[:, 2] *= -1
    normals = normals[:, [0, 2, 1]].copy()
    normals[:, 2] *= -1
    return positions, normals, indices


def slug(name):
    return re.sub(r"[^a-z0-9]+", "-", name.lower()).strip("-")


class GLB:
    def __init__(self):
        self.data = bytearray()
        self.document = {"asset": {"version": "2.0", "generator": "Anatomy Finder / BodyParts3D importer", "copyright": "BodyParts3D, © The Database Center for Life Science. See /models/bodyparts3d/ATTRIBUTION.txt"}, "scene": 0, "scenes": [{"nodes": []}], "nodes": [], "meshes": [], "materials": [], "accessors": [], "bufferViews": []}
        self.materials = {}

    def accessor(self, values, kind, component, target):
        values = np.ascontiguousarray(values)
        while len(self.data) % 4:
            self.data.append(0)
        offset = len(self.data)
        self.data.extend(values.tobytes())
        view = len(self.document["bufferViews"])
        self.document["bufferViews"].append({"buffer": 0, "byteOffset": offset, "byteLength": values.nbytes, "target": target})
        result = {"bufferView": view, "componentType": component, "count": len(values), "type": kind}
        if kind == "VEC3":
            result.update(min=values.min(axis=0).tolist(), max=values.max(axis=0).tolist())
        index = len(self.document["accessors"])
        self.document["accessors"].append(result)
        return index

    def add(self, record, color):
        positions, normals, indices = [], [], []
        offset = 0
        for element in record["elementIds"]:
            p, n, i = transformed(element)
            positions.append(p)
            normals.append(n)
            indices.append(i + offset)
            offset += len(p)
        p, n, i = np.concatenate(positions), np.concatenate(normals), np.concatenate(indices)
        if color not in self.materials:
            self.materials[color] = len(self.document["materials"])
            rgb = [int(color[k:k + 2], 16) / 255 for k in (1, 3, 5)]
            # GLTF baseColorFactor is linear, not sRGB.
            rgb = [c / 12.92 if c <= .04045 else ((c + .055) / 1.055) ** 2.4 for c in rgb]
            self.document["materials"].append({"name": color, "pbrMetallicRoughness": {"baseColorFactor": rgb + [1], "metallicFactor": 0, "roughnessFactor": .62}})
        position = self.accessor(p.astype("<f4"), "VEC3", 5126, 34962)
        normal = self.accessor(n.astype("<f4"), "VEC3", 5126, 34962)
        index = self.accessor(i.astype("<u4"), "SCALAR", 5125, 34963)
        mesh = len(self.document["meshes"])
        self.document["meshes"].append({"name": record["id"], "primitives": [{"attributes": {"POSITION": position, "NORMAL": normal}, "indices": index, "material": self.materials[color]}]})
        self.document["scenes"][0]["nodes"].append(len(self.document["nodes"]))
        self.document["nodes"].append({"name": record["id"], "mesh": mesh, "extras": {"fmaId": record["fmaId"], "sourceName": record["sourceName"], "elementIds": record["elementIds"]}})
        record["vertexCount"] = len(p)
        record["triangleCount"] = len(i) // 3
        record["bounds"] = [p.min(axis=0).tolist(), p.max(axis=0).tolist()]

    def write(self, filename):
        self.document["buffers"] = [{"byteLength": len(self.data)}]
        document = json.dumps(self.document, separators=(",", ":")).encode()
        document += b" " * (-len(document) % 4)
        self.data += bytes(-len(self.data) % 4)
        total = 12 + 8 + len(document) + 8 + len(self.data)
        filename.write_bytes(struct.pack("<III", 0x46546C67, 2, total) + struct.pack("<II", len(document), 0x4E4F534A) + document + struct.pack("<II", len(self.data), 0x004E4942) + self.data)


organs = ["FMA50801", "FMA7088", "FMA7309", "FMA7310", "FMA7197", "FMA7148", "FMA7204", "FMA7205", "FMA7196", "FMA7198", "FMA7200", "FMA7201", "FMA15900", "FMA7394", "FMA7131"]
specification = {"skin": ["FMA7163"], "muscles": sorted(set(leaves("FMA5022") + leaves("FMA10474") + leaves("FMA85453"))), "organs": organs, "skeleton": list(dict.fromkeys(leaves("FMA5018") + leaves("FMA10483") + regional_leaves("FMA23881")))}
colors = {"skin": "#bd9d87", "muscles": "#a55250", "organs": "#b97f78", "skeleton": "#e2dccc"}
organ_colors = {"FMA50801": "#c2a3a0", "FMA7088": "#9e4446", "FMA7309": "#ba9294", "FMA7310": "#ba9294", "FMA7197": "#86534b", "FMA7148": "#cb997b", "FMA7204": "#925147", "FMA7205": "#925147", "FMA7196": "#81546b", "FMA7198": "#d7b57e", "FMA7200": "#be9585", "FMA7201": "#ba9d87", "FMA15900": "#c3a37e", "FMA7394": "#bcb5a1", "FMA7131": "#b88277"}
OUTPUT.mkdir(parents=True, exist_ok=True)
records, layer_records = [], {}
for layer, identifiers in specification.items():
    glb, owned, selected = GLB(), set(), []
    for identifier in identifiers:
        source_elements = sorted(set(elements[identifier]))
        missing = [element for element in source_elements if element not in files]
        if missing:
            raise ValueError(f"Missing source meshes for {identifier}: {missing}")
        unique = [element for element in source_elements if element not in owned]
        if not unique:
            continue
        owned.update(unique)
        source_name = labels[identifier]
        record = {"id": slug(source_name), "name": source_name[0].upper() + source_name[1:], "sourceName": source_name, "fmaId": identifier, "layer": layer, "elementIds": unique, "parentNames": [labels[p] for p in parents[identifier] if p in labels], "meshNames": [slug(source_name)], "isGroup": False}
        glb.add(record, organ_colors.get(identifier, colors[layer]))
        selected.append(record)
    glb.write(OUTPUT / f"{layer}.glb")
    records.extend(selected)
    version = hashlib.sha256((OUTPUT / f"{layer}.glb").read_bytes()).hexdigest()[:12]
    layer_records[layer] = {"url": f"/models/bodyparts3d/{layer}.glb?v={version}", "bytes": (OUTPUT / f"{layer}.glb").stat().st_size, "structureCount": len(selected), "triangleCount": sum(r["triangleCount"] for r in selected)}
    print(layer, layer_records[layer], flush=True)

# Composite selections are metadata views onto existing meshes, never duplicate
# overlaid geometry. All membership comes from the original FMA element tables.
groups = [("skull", "Skull", "FMA46565", "skeleton"), ("spine", "Vertebral column", "FMA13478", "skeleton"), ("ribs", "Rib cage", "FMA7480", "skeleton"), ("pelvis", "Pelvis", "FMA9578", "skeleton"), ("muscles", "Muscle collection", "FMA5022", "muscles")]
for identifier, name, fma, layer in groups:
    roots = ["FMA5022", "FMA10474", "FMA85453"] if identifier == "muscles" else [fma]
    member_elements = set(e for root in roots for e in elements[root])
    members = [r for r in records if r["layer"] == layer and not r["isGroup"] and set(r["elementIds"]) <= member_elements]
    if not members:
        raise ValueError(f"Empty group {identifier}")
    records.append({"id": identifier, "name": name, "sourceName": "; ".join(labels[root] for root in roots), "fmaId": " / ".join(roots), "layer": layer, "elementIds": sorted({e for r in members for e in r["elementIds"]}), "parentNames": [labels[p] for p in parents[fma] if p in labels], "meshNames": [r["id"] for r in members], "isGroup": True})

manifest = {"dataset": "BodyParts3D", "version": "4.0 / obj_99", "sourceUrl": SOURCE_URL, "licenseUrl": "https://dbarchive.biosciencedbc.jp/en/bodyparts3d/lic.html", "retrievedOn": "2026-09-09", "transform": {"sourceCenterMm": center.tolist(), "scale": scale, "axisMapping": "X, Z, -Y; then Y + 0.15"}, "layers": layer_records, "structures": records, "sourceHashes": {p.name: hashlib.sha256(p.read_bytes()).hexdigest() for p in SOURCE.iterdir() if p.is_file()}}
(ROOT / "src/data/atlasManifest.ts").write_text('import type { AtlasManifest } from "../types/atlas";\n\n// Generated by scripts/import_bodyparts3d.py. Do not edit by hand.\nexport const atlasManifest: AtlasManifest = ' + json.dumps(manifest, ensure_ascii=False, indent=2) + ';\n', encoding="utf-8")
(OUTPUT / "manifest.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding="utf-8")
print("Imported", len(records), "selectable structures/groups", flush=True)
