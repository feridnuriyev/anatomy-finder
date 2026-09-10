import type { AtlasStructure } from "../types/atlas";

export interface EducationalSource {
  title: string;
  url: string;
  license: string;
}

const OPENSTAX_LICENSE = "CC BY-NC-SA 4.0";
const OPENSTAX_BOOK = "OpenStax, Anatomy and Physiology 2e";

const sources = {
  skeleton: {
    title: `${OPENSTAX_BOOK}, 6.1: The Functions of the Skeletal System`,
    url: "https://openstax.org/books/anatomy-and-physiology-2e/pages/6-1-the-functions-of-the-skeletal-system",
    license: OPENSTAX_LICENSE,
  },
  muscle: {
    title: `${OPENSTAX_BOOK}, Chapter 11: The Muscular System`,
    url: "https://openstax.org/books/anatomy-and-physiology-2e/pages/11-introduction",
    license: OPENSTAX_LICENSE,
  },
  skin: {
    title: `${OPENSTAX_BOOK}, Chapter 5: The Integumentary System`,
    url: "https://openstax.org/books/anatomy-and-physiology-2e/pages/5-introduction",
    license: OPENSTAX_LICENSE,
  },
  nervous: {
    title: `${OPENSTAX_BOOK}, Chapter 13: Anatomy of the Nervous System`,
    url: "https://openstax.org/books/anatomy-and-physiology-2e/pages/13-introduction",
    license: OPENSTAX_LICENSE,
  },
  cardiovascular: {
    title: `${OPENSTAX_BOOK}, Chapter 19: The Cardiovascular System`,
    url: "https://openstax.org/books/anatomy-and-physiology-2e/pages/19-introduction",
    license: OPENSTAX_LICENSE,
  },
  respiratory: {
    title: `${OPENSTAX_BOOK}, Chapter 22: The Respiratory System`,
    url: "https://openstax.org/books/anatomy-and-physiology-2e/pages/22-introduction",
    license: OPENSTAX_LICENSE,
  },
  digestive: {
    title: `${OPENSTAX_BOOK}, Chapter 23: The Digestive System`,
    url: "https://openstax.org/books/anatomy-and-physiology-2e/pages/23-introduction",
    license: OPENSTAX_LICENSE,
  },
  urinary: {
    title: `${OPENSTAX_BOOK}, Chapter 25: The Urinary System`,
    url: "https://openstax.org/books/anatomy-and-physiology-2e/pages/25-introduction",
    license: OPENSTAX_LICENSE,
  },
  lymphatic: {
    title: `${OPENSTAX_BOOK}, Chapter 21: The Lymphatic and Immune System`,
    url: "https://openstax.org/books/anatomy-and-physiology-2e/pages/21-introduction",
    license: OPENSTAX_LICENSE,
  },
} satisfies Record<string, EducationalSource>;

const organDescriptions: Record<string, { description: string; function: string; source: EducationalSource }> = {
  brain: { description: "The brain is the central organ of the nervous system and lies within the cranial cavity. It receives and integrates information, coordinates responses, and supports functions including movement, sensation, memory, language, and emotion.", function: "Integrates information and coordinates nervous-system activity.", source: sources.nervous },
  heart: { description: "The heart is a muscular organ located in the thoracic cavity between the lungs. Its rhythmic contractions drive blood through the pulmonary and systemic circulations, delivering oxygen and nutrients while carrying away metabolic waste.", function: "Pumps blood through the pulmonary and systemic circulations.", source: sources.cardiovascular },
  "right-lung": { description: "The right lung is one of the paired respiratory organs in the thoracic cavity. It exchanges oxygen and carbon dioxide between inhaled air and blood across the surfaces of its alveoli.", function: "Supports gas exchange between air and blood.", source: sources.respiratory },
  "left-lung": { description: "The left lung is one of the paired respiratory organs and occupies the left side of the thoracic cavity. It exchanges oxygen and carbon dioxide between inhaled air and blood across the surfaces of its alveoli.", function: "Supports gas exchange between air and blood.", source: sources.respiratory },
  liver: { description: "The liver is a large organ in the upper right abdomen. It processes absorbed nutrients, produces bile, stores selected nutrients, and modifies or removes many substances carried in the blood.", function: "Processes nutrients, produces bile, and contributes to metabolic regulation.", source: sources.digestive },
  stomach: { description: "The stomach is an expandable muscular organ between the esophagus and small intestine. It stores and churns food, mixes it with gastric secretions, begins substantial protein digestion, and releases chyme gradually into the small intestine.", function: "Stores, mixes, and begins the chemical digestion of food.", source: sources.digestive },
  "right-kidney": { description: "The right kidney is a urinary organ positioned behind the abdominal lining. It filters blood to form urine and helps regulate fluid volume, electrolyte balance, acid–base balance, and blood pressure.", function: "Filters blood and helps maintain the composition and volume of body fluids.", source: sources.urinary },
  "left-kidney": { description: "The left kidney is a urinary organ positioned behind the abdominal lining. It filters blood to form urine and helps regulate fluid volume, electrolyte balance, acid–base balance, and blood pressure.", function: "Filters blood and helps maintain the composition and volume of body fluids.", source: sources.urinary },
  spleen: { description: "The spleen is a lymphatic organ in the upper left abdomen. It filters blood, removes aged blood cells and platelets, stores platelets, and supports immune responses to blood-borne material.", function: "Filters blood and supports immune surveillance.", source: sources.lymphatic },
  pancreas: { description: "The pancreas is a glandular organ behind the stomach. Its exocrine tissue releases digestive enzymes and bicarbonate into the small intestine, while its endocrine tissue releases hormones that help regulate blood glucose.", function: "Supports digestion and hormonal control of blood glucose.", source: sources.digestive },
  "small-intestine": { description: "The small intestine extends from the stomach to the large intestine. It completes most chemical digestion and is the principal site where nutrients are absorbed into blood and lymph.", function: "Completes digestion and absorbs most nutrients.", source: sources.digestive },
  "large-intestine": { description: "The large intestine receives material that remains after passage through the small intestine. It absorbs water and electrolytes, houses a large microbial community, compacts feces, and stores them before elimination.", function: "Absorbs water and compacts and stores fecal material.", source: sources.digestive },
  "urinary-bladder": { description: "The urinary bladder is a hollow muscular organ in the pelvic cavity. It stores urine arriving from the kidneys through the ureters and expels it through the urethra during urination.", function: "Temporarily stores and expels urine.", source: sources.urinary },
  trachea: { description: "The trachea is an air-conducting tube that connects the larynx with the main bronchi. Cartilage supports its airway, while its lining helps warm, humidify, and clear particles from inhaled air.", function: "Conducts air between the larynx and bronchi.", source: sources.respiratory },
  esophagus: { description: "The esophagus is a muscular tube connecting the pharynx to the stomach. Coordinated muscular contractions move swallowed material toward the stomach.", function: "Transports swallowed material to the stomach.", source: sources.digestive },
};

const majorBoneRoles: Array<[RegExp, string]> = [
  [/femur/i, "It bears and transmits load between the hip and knee and provides attachment sites for muscles of the hip and thigh."],
  [/tibia/i, "It is the major weight-bearing bone of the lower leg and helps form the knee and ankle joints."],
  [/fibula/i, "It stabilizes the lower leg and ankle and provides broad attachment surfaces for muscles, while carrying relatively little body weight."],
  [/humerus/i, "It forms the bony framework of the upper arm and participates in the shoulder and elbow joints."],
  [/radius/i, "It helps form the elbow and wrist and rotates around the ulna during turning movements of the forearm."],
  [/ulna/i, "It provides the main hinge articulation at the elbow and supports the medial side of the forearm."],
  [/scapula/i, "It provides a mobile base and attachment surface for muscles that position and move the shoulder and upper limb."],
  [/clavicle/i, "It braces the shoulder away from the trunk and transmits forces from the upper limb to the axial skeleton."],
  [/rib/i, "It contributes to the thoracic cage, helping protect thoracic organs and supporting the mechanics of breathing."],
  [/sternum/i, "It anchors ribs at the front of the thoracic cage and helps protect organs within the chest."],
  [/vertebra|sacrum|coccyx/i, "It contributes to the vertebral column, which supports the trunk and protects neural structures within the spinal canal."],
  [/skull|cranium|occipital|frontal bone|parietal|temporal bone/i, "It contributes to the skull, which supports facial structures and encloses and protects the brain."],
];

function article(name: string) {
  return /^[aeiou]/i.test(name) ? "an" : "a";
}

export function educationalContent(item: AtlasStructure) {
  const organ=organDescriptions[item.id];
  if(organ)return organ;
  const name=item.name;
  const region=item.parentNames[0] ? ` The source archive associates it with ${item.parentNames[0]}.` : "";
  if(item.layer==="skin")return {
    description: "The skin is the body's external covering and its largest organ. It forms a protective barrier, contributes to sensation and temperature regulation, and limits water loss.",
    function: "Protects the body and contributes to sensation and temperature regulation.",
    source:sources.skin,
  };
  if(item.layer==="skeleton"){
    const role=majorBoneRoles.find(([pattern])=>pattern.test(name))?.[1] ?? "Like other bones, it contributes to support, protection, movement, mineral storage, or blood-cell production according to its location and internal structure.";
    return {
      description:`The ${name} is ${article(name)} ${name.toLowerCase()} represented in the BodyParts3D skeletal atlas.${region} ${role}`,
      function:role,
      source:sources.skeleton,
    };
  }
  if(item.layer==="muscles")return {
    description:`The ${name} is a skeletal muscle represented in the BodyParts3D atlas.${region} Skeletal muscles contract to produce or control movement and also help stabilize joints and maintain posture; the exact action of this muscle depends on its attachments.`,
    function:"Produces or controls movement and contributes to regional stability according to its attachments.",
    source:sources.muscle,
  };
  return {
    description:`The ${name} is an anatomical structure represented in the BodyParts3D atlas.${region} Its role is interpreted within the organ system and region to which it belongs.`,
    function:"Contributes to the function of its associated anatomical system.",
    source:sources.digestive,
  };
}
