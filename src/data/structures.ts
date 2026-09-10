import type { AnatomicalStructure } from "../types/anatomy";
import { atlasManifest } from "./atlasManifest.ts";
import { educationalContent } from "./structureDescriptions.ts";
export const structures:AnatomicalStructure[]=atlasManifest.structures.map(item=>{
  const educational=educationalContent(item);
  return ({
  id:item.id,name:item.name,layer:item.layer,
  system:item.layer==="skeleton"?"Skeletal system":item.layer==="muscles"?"Muscular system":item.layer==="skin"?"Integumentary system":"Internal organs",
  location:item.parentNames.join(", ")||"No regional parent supplied in the archive",
  description:educational.description,
  function:educational.function,
  related:atlasManifest.structures.filter(group=>group.isGroup&&group.id!==item.id&&item.meshNames.some(name=>group.meshNames.includes(name))).map(group=>group.id).slice(0,4),
  modelObjectName:item.meshNames[0],children:item.isGroup?item.meshNames:undefined,
  source:{dataset:atlasManifest.dataset,version:atlasManifest.version,fmaId:item.fmaId,url:atlasManifest.sourceUrl,licenseUrl:atlasManifest.licenseUrl,sourceName:item.sourceName},
  contentSource:educational.source,
})});
