import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const output = resolve(root, 'src/data/atlas.json');
const PRESENT = 2026;

const regions = [
  ['africa', 'África', 'África', '#c79a42', 'África continental y diásporas africanas'],
  ['europe', 'Europa', 'Europa', '#4fb26f', 'Europa, Mediterráneo septentrional y tradiciones indoeuropeas europeas'],
  ['middle-east', 'Oriente Próximo', 'Or. Próximo', '#d7c63f', 'Levante, Mesopotamia, Arabia, Anatolia e Irán'],
  ['north-eurasia', 'Eurasia septentrional', 'N. Eurasia', '#d39a2f', 'Estepas, Siberia, regiones urálicas y Asia interior'],
  ['south-asia', 'Asia meridional', 'Asia S.', '#ef842e', 'Subcontinente indio y Sri Lanka'],
  ['east-asia', 'Asia central y oriental', 'Asia E.', '#ef4e32', 'China, Corea, Japón, Tíbet y Asia central oriental'],
  ['southeast-asia', 'Sudeste asiático', 'SE Asia', '#e94b88', 'Sudeste asiático continental e insular'],
  ['oceania', 'Oceanía', 'Oceanía', '#a965ca', 'Australia, Nueva Guinea y Melanesia'],
  ['pacific', 'Islas del Pacífico', 'Pacífico', '#7867d8', 'Micronesia y Polinesia'],
  ['north-america', 'Norteamérica', 'N. América', '#8b68d6', 'Ártico, costa noroccidental, llanuras, bosques y suroeste'],
  ['mesoamerica', 'Mesoamérica', 'Mesoamérica', '#5687da', 'México y América Central precolombina'],
  ['south-america', 'Sudamérica', 'S. América', '#45b97b', 'Andes, Amazonia, Chaco, Patagonia y Caribe suramericano']
].map(([id, name, shortName, color, scope], order) => ({ id, name, shortName, color, scope, order }));

const summaries = {
  'ritual-symbolism-africa': 'Conjunto arqueológico, no una religión identificable: enterramientos, pigmentos y objetos simbólicos permiten hablar de conducta ritual sin reconstruir doctrinas concretas.',
  'proto-indo-european': 'Reconstrucción comparativa de motivos, vocabulario y estructuras rituales compartidas por varias tradiciones indoeuropeas; no se conserva como institución histórica directa.',
  'ancient-egyptian': 'Tradición plural de cultos templarios, funerarios y reales del valle del Nilo, transformada durante más de tres milenios.',
  'mesopotamian': 'Conjunto de religiones sumerias, acadias, babilonias y asirias articuladas en torno a ciudades, templos y panteones relacionados.',
  'judaism': 'Tradición israelita y judía desarrollada a través del culto antiguo, la literatura bíblica, el Segundo Templo y las corrientes rabínicas posteriores.',
  'christianity': 'Movimiento surgido en el judaísmo del siglo I en torno a Jesús de Nazaret, diversificado después en numerosas iglesias y tradiciones.',
  'islam': 'Tradición monoteísta surgida en Arabia en el siglo VII en torno al Corán y a la predicación de Mahoma; comprende ramas jurídicas, teológicas y místicas diversas.',
  'zoroastrianism': 'Tradición irania asociada a Zaratustra y a la veneración de Ahura Mazda; su cronología inicial continúa siendo debatida.',
  'hinduism': 'Familia histórica de tradiciones del sur de Asia vinculadas con los Vedas, la práctica ritual, la devoción, la filosofía y múltiples teologías.',
  'buddhism': 'Tradiciones originadas en las enseñanzas atribuidas a Siddhartha Gautama, organizadas en comunidades monásticas y múltiples escuelas asiáticas y globales.',
  'jainism': 'Tradición śramaṇa centrada en los tīrthaṅkaras, la no violencia, la disciplina ascética y la liberación del ciclo de renacimientos.',
  'sikhism': 'Tradición fundada en el Punjab a partir de las enseñanzas de Gurú Nanak y los gurús sucesivos, con el Gurú Granth Sahib como autoridad escritural.',
  'confucianism': 'Tradición ética, ritual y política formada alrededor de Confucio y de los clásicos, con desarrollos imperiales, neoconfucianos y modernos.',
  'taoism': 'Conjunto de corrientes filosóficas, rituales, comunitarias y alquímicas chinas relacionadas con el Dao y con diversos linajes institucionales.',
  'chinese-folk': 'Complejo cambiante de cultos locales, ancestros, dioses, rituales comunitarios y prácticas domésticas; se entrelaza con taoísmo, budismo y confucianismo.',
  'shinto': 'Tradiciones rituales japonesas vinculadas a los kami, santuarios y calendarios locales; su definición institucional moderna no debe proyectarse sin matices al pasado remoto.',
  'tengrism': 'Etiqueta moderna para tradiciones de la estepa y Asia interior relacionadas con Tengri, los antepasados, el paisaje y especialistas rituales.',
  'aboriginal-australian': 'Pluralidad de leyes, relatos, lugares y prácticas de los pueblos aborígenes australianos; “Tiempo del Sueño” es una traducción simplificadora de conceptos diversos.',
  'maya': 'Tradiciones mesoamericanas de larga duración, con calendarios, deidades, culto dinástico y prácticas comunitarias que continúan transformadas tras la conquista.',
  'aztec': 'Religión estatal y comunitaria de la Triple Alianza mexica, heredera y reformuladora de tradiciones mesoamericanas anteriores.',
  'inca': 'Sistema ritual imperial del Tawantinsuyu articulado con cultos solares, huacas, ancestros y tradiciones andinas locales.',
  'native-north-american': 'Rótulo de navegación para tradiciones indígenas muy diversas; no implica una doctrina panamericana única.'
};

function tradition(id, name, regionId, startYear, endYear, parentId, lane, family, options = {}) {
  const active = endYear === null;
  const deep = startYear <= -10_000;
  return {
    id,
    name,
    alternativeNames: options.aliases ?? [],
    regionId,
    parentId,
    startYear,
    endYear,
    lane,
    kind: options.kind ?? 'religion',
    status: options.status ?? (active ? 'active' : 'historical'),
    precision: options.precision ?? (deep ? 'deep-time' : Math.abs(startYear) > 3000 ? 'millennium' : 'century'),
    confidence: options.confidence ?? (deep ? 'low' : 'medium'),
    family,
    summary: options.summary ?? summaries[id] ?? `${name} se representa como una tradición o complejo histórico de la familia ${family}. La fecha indica una aparición aproximada en el registro disponible, no un instante fundacional necesariamente exacto.`,
    relationToParent: parentId ? (options.relation ?? 'descent') : null,
    sources: options.sources ?? ['poster-3', 'wikipedia-list', 'academic-synthesis'],
    posterVerified: options.poster ?? true,
    verifierMatched: options.verifier ?? true,
    importance: options.importance ?? 2
  };
}

const T = tradition;

const traditions = [
  // África
  T('ritual-symbolism-africa', 'Conducta ritual y simbolismo africano', 'africa', -120000, -10000, null, .08, 'prehistoria ritual', { kind: 'substrate', verifier: false, importance: 1 }),
  T('san-traditions', 'Tradiciones san', 'africa', -25000, null, 'ritual-symbolism-africa', .15, 'cazadores-recolectores', { kind: 'folk', relation: 'context', importance: 1 }),
  T('khoisan-traditions', 'Tradiciones khoisán', 'africa', -12000, null, 'ritual-symbolism-africa', .25, 'cazadores-recolectores', { kind: 'folk', relation: 'context' }),
  T('nilotic-traditions', 'Tradiciones nilóticas', 'africa', -6000, null, 'ritual-symbolism-africa', .36, 'religiones africanas', { kind: 'folk' }),
  T('bantu-traditions', 'Tradiciones bantúes', 'africa', -3000, null, 'ritual-symbolism-africa', .46, 'religiones africanas', { kind: 'folk', relation: 'migration', importance: 1 }),
  T('yoruba', 'Religión yoruba', 'africa', -1000, null, 'bantu-traditions', .55, 'religiones africanas', { kind: 'folk', aliases: ['Ìṣẹ̀ṣe'] }),
  T('akan', 'Religión akan', 'africa', -800, null, 'bantu-traditions', .64, 'religiones africanas', { kind: 'folk' }),
  T('vodun-west-african', 'Vodun de África occidental', 'africa', -500, null, 'bantu-traditions', .72, 'religiones africanas', { kind: 'folk' }),
  T('serer', 'Religión serer', 'africa', -1000, null, 'nilotic-traditions', .82, 'religiones africanas', { kind: 'folk' }),
  T('ancient-egyptian', 'Religión del antiguo Egipto', 'africa', -4000, 550, 'nilotic-traditions', .92, 'nilo-africana', { importance: 1 }),
  T('nubian-religion', 'Religiones nubias y kushitas', 'africa', -2500, 550, 'nilotic-traditions', .84, 'nilo-africana'),
  T('carthaginian', 'Religión púnica y cartaginesa', 'africa', -800, 400, null, .08, 'semítica occidental', { relation: 'migration' }),
  T('coptic-orthodox', 'Cristianismo copto', 'africa', 42, null, 'christianity', .92, 'cristianismo', { kind: 'denomination', importance: 1 }),
  T('ethiopian-orthodox', 'Cristianismo ortodoxo etíope', 'africa', 330, null, 'christianity', .83, 'cristianismo', { kind: 'denomination' }),
  T('african-islam', 'Islam africano', 'africa', 640, null, 'islam', .74, 'islam', { kind: 'movement', relation: 'migration', importance: 1 }),
  T('mouraide', 'Muridiyya', 'africa', 1883, null, 'sufism', .67, 'islam', { kind: 'movement', aliases: ['Mouride'] }),
  T('african-diasporic', 'Religiones de la diáspora africana', 'africa', 1500, null, 'vodun-west-african', .56, 'afrodiaspórica', { kind: 'movement', relation: 'migration', importance: 1 }),
  T('rastafari', 'Rastafari', 'africa', 1930, null, 'african-diasporic', .45, 'afrodiaspórica', { kind: 'movement', relation: 'syncretism' }),
  T('zion-christian', 'Zion Christian Church', 'africa', 1910, null, 'christianity', .36, 'cristianismo', { kind: 'denomination', relation: 'reform' }),
  T('kimbanguism', 'Kimbanguismo', 'africa', 1921, null, 'christianity', .26, 'cristianismo', { kind: 'denomination', relation: 'reform' }),

  // Europa
  T('ritual-symbolism-europe', 'Ritual paleolítico europeo', 'europe', -45000, -8000, null, .08, 'prehistoria ritual', { kind: 'substrate', verifier: false, importance: 1 }),
  T('neolithic-europe', 'Complejos rituales neolíticos europeos', 'europe', -7000, -2500, 'ritual-symbolism-europe', .16, 'neolítico europeo', { kind: 'ritual-complex', relation: 'context', importance: 1 }),
  T('proto-indo-european', 'Religión protoindoeuropea reconstruida', 'europe', -4500, -2000, null, .26, 'indoeuropea', { kind: 'substrate', status: 'reconstructed', confidence: 'hypothesis', importance: 1 }),
  T('minoan-religion', 'Religión minoica', 'europe', -3000, -1100, 'neolithic-europe', .34, 'egea'),
  T('greek-religion', 'Religión griega antigua', 'europe', -1600, 500, 'proto-indo-european', .43, 'indoeuropea', { importance: 1 }),
  T('hellenistic-religion', 'Religión helenística', 'europe', -323, 400, 'greek-religion', .48, 'helénica', { kind: 'movement' }),
  T('roman-religion', 'Religión romana', 'europe', -800, 500, 'proto-indo-european', .55, 'indoeuropea', { importance: 1 }),
  T('mystery-cults', 'Cultos mistéricos grecorromanos', 'europe', -600, 500, 'greek-religion', .61, 'helénica', { kind: 'movement', relation: 'syncretism' }),
  T('celtic-religion', 'Religiones celtas', 'europe', -1200, 800, 'proto-indo-european', .68, 'indoeuropea'),
  T('germanic-religion', 'Religión germánica', 'europe', -1000, 1200, 'proto-indo-european', .74, 'indoeuropea', { importance: 1 }),
  T('norse-religion', 'Religión nórdica', 'europe', 200, 1200, 'germanic-religion', .78, 'indoeuropea'),
  T('slavic-religion', 'Religión eslava', 'europe', -500, 1300, 'proto-indo-european', .84, 'indoeuropea'),
  T('baltic-religion', 'Religión báltica', 'europe', -500, 1500, 'proto-indo-european', .9, 'indoeuropea'),
  T('european-christianity', 'Cristianización de Europa', 'europe', 300, null, 'christianity', .22, 'cristianismo', { kind: 'movement', relation: 'migration', importance: 1 }),
  T('catholicism', 'Iglesia católica latina', 'europe', 400, null, 'christianity', .32, 'cristianismo', { kind: 'denomination', importance: 1 }),
  T('eastern-orthodoxy', 'Cristianismo ortodoxo oriental', 'europe', 451, null, 'christianity', .4, 'cristianismo', { kind: 'denomination', importance: 1 }),
  T('protestantism', 'Protestantismo', 'europe', 1517, null, 'catholicism', .5, 'cristianismo', { kind: 'movement', relation: 'reform', importance: 1 }),
  T('lutheranism', 'Luteranismo', 'europe', 1520, null, 'protestantism', .57, 'cristianismo', { kind: 'denomination', relation: 'reform' }),
  T('reformed-christianity', 'Cristianismo reformado', 'europe', 1520, null, 'protestantism', .63, 'cristianismo', { kind: 'denomination', relation: 'reform' }),
  T('anglicanism', 'Anglicanismo', 'europe', 1534, null, 'protestantism', .7, 'cristianismo', { kind: 'denomination', relation: 'reform' }),
  T('anabaptism', 'Anabaptismo', 'europe', 1525, null, 'protestantism', .77, 'cristianismo', { kind: 'movement', relation: 'reform' }),
  T('methodism', 'Metodismo', 'europe', 1738, null, 'anglicanism', .83, 'cristianismo', { kind: 'denomination', relation: 'reform' }),
  T('wicca', 'Wicca', 'europe', 1954, null, 'neopaganism', .91, 'neopaganismo', { kind: 'movement', relation: 'reform' }),
  T('neopaganism', 'Neopaganismos europeos', 'europe', 1800, null, 'proto-indo-european', .95, 'neopaganismo', { kind: 'movement', status: 'active', relation: 'influence', confidence: 'high' }),

  // Oriente Próximo
  T('levantine-neolithic', 'Complejos rituales del Levante neolítico', 'middle-east', -10500, -4000, null, .06, 'neolítico próximo-oriental', { kind: 'ritual-complex', verifier: false, importance: 1 }),
  T('anatolian-neolithic', 'Complejos rituales de Anatolia', 'middle-east', -9500, -5000, null, .12, 'neolítico próximo-oriental', { kind: 'ritual-complex', verifier: false }),
  T('mesopotamian', 'Religiones mesopotámicas', 'middle-east', -4000, -100, 'levantine-neolithic', .2, 'semítica y sumeria', { relation: 'context', importance: 1 }),
  T('sumerian', 'Religión sumeria', 'middle-east', -3500, -1800, 'mesopotamian', .25, 'sumeria'),
  T('akkadian', 'Religión acadia', 'middle-east', -2400, -1000, 'mesopotamian', .3, 'semítica oriental'),
  T('babylonian', 'Religión babilónica', 'middle-east', -1900, -100, 'akkadian', .35, 'semítica oriental'),
  T('assyrian', 'Religión asiria', 'middle-east', -2000, -600, 'akkadian', .4, 'semítica oriental'),
  T('canaanite', 'Religiones cananeas', 'middle-east', -3000, -300, 'levantine-neolithic', .47, 'semítica occidental', { importance: 1 }),
  T('ugaritic', 'Religión ugarítica', 'middle-east', -1800, -1200, 'canaanite', .51, 'semítica occidental'),
  T('phoenician', 'Religión fenicia', 'middle-east', -1500, 300, 'canaanite', .55, 'semítica occidental'),
  T('ancient-israelite', 'Religión israelita antigua', 'middle-east', -1200, -500, 'canaanite', .6, 'israelita', { relation: 'reform', importance: 1 }),
  T('judaism', 'Judaísmo', 'middle-east', -500, null, 'ancient-israelite', .64, 'abrahámica', { kind: 'religion', relation: 'reform', importance: 1, precision: 'century', confidence: 'high' }),
  T('second-temple-judaism', 'Judaísmo del Segundo Templo', 'middle-east', -516, 70, 'judaism', .68, 'judaísmo', { kind: 'movement' }),
  T('rabbinic-judaism', 'Judaísmo rabínico', 'middle-east', 70, null, 'second-temple-judaism', .72, 'judaísmo', { kind: 'movement', relation: 'reform' }),
  T('christianity', 'Cristianismo', 'middle-east', 30, null, 'second-temple-judaism', .76, 'abrahámica', { kind: 'religion', relation: 'reform', importance: 1, precision: 'decade', confidence: 'high' }),
  T('gnostic-movements', 'Movimientos gnósticos', 'middle-east', 100, 500, 'second-temple-judaism', .8, 'religiones tardoantiguas', { kind: 'movement', relation: 'context' }),
  T('mandeaism', 'Mandeísmo', 'middle-east', 100, null, 'gnostic-movements', .84, 'gnóstica', { relation: 'context' }),
  T('islam', 'Islam', 'middle-east', 610, null, 'christianity', .88, 'abrahámica', { kind: 'religion', relation: 'context', importance: 1, precision: 'year', confidence: 'high' }),
  T('sunni-islam', 'Islam suní', 'middle-east', 661, null, 'islam', .92, 'islam', { kind: 'denomination', importance: 1 }),
  T('shia-islam', 'Islam chií', 'middle-east', 632, null, 'islam', .96, 'islam', { kind: 'denomination', importance: 1 }),
  T('ibadism', 'Ibadismo', 'middle-east', 657, null, 'islam', .98, 'islam', { kind: 'denomination' }),
  T('sufism', 'Sufismo', 'middle-east', 750, null, 'islam', .82, 'islam', { kind: 'movement', relation: 'reform', importance: 1 }),
  T('druze', 'Fe drusa', 'middle-east', 1017, null, 'shia-islam', .75, 'abrahámica', { relation: 'reform' }),
  T('babism', 'Bábismo', 'middle-east', 1844, 1863, 'shia-islam', .7, 'abrahámica', { kind: 'movement', relation: 'reform' }),
  T('bahai', 'Fe baháʼí', 'middle-east', 1863, null, 'babism', .66, 'abrahámica', { kind: 'religion', relation: 'reform', importance: 1 }),
  T('zoroastrianism', 'Zoroastrismo', 'middle-east', -1200, null, null, .08, 'irania', { importance: 1, precision: 'disputed', confidence: 'low' }),
  T('zurvanism', 'Zurvanismo', 'middle-east', -500, 1000, 'zoroastrianism', .12, 'irania', { kind: 'movement', relation: 'reform' }),
  T('manichaeism', 'Maniqueísmo', 'middle-east', 240, 1400, 'zoroastrianism', .16, 'irania y sincrética', { kind: 'movement', relation: 'syncretism', importance: 1 }),
  T('yazidism', 'Yazidismo', 'middle-east', 1100, null, null, .22, 'iranio-mesopotámica', { precision: 'disputed', confidence: 'medium' }),

  // Eurasia septentrional
  T('siberian-ritual', 'Tradiciones paleosiberianas', 'north-eurasia', -30000, null, null, .08, 'paleosiberiana', { kind: 'folk', importance: 1 }),
  T('uralic-religions', 'Religiones urálicas', 'north-eurasia', -4000, null, 'siberian-ritual', .18, 'urálica', { kind: 'folk', relation: 'migration', importance: 1 }),
  T('sami-religion', 'Religión sami', 'north-eurasia', -1000, null, 'uralic-religions', .28, 'urálica', { kind: 'folk' }),
  T('finnic-religion', 'Religión finesa', 'north-eurasia', -1000, 1300, 'uralic-religions', .36, 'urálica', { kind: 'folk' }),
  T('mari-religion', 'Religión tradicional mari', 'north-eurasia', -500, null, 'uralic-religions', .44, 'urálica', { kind: 'folk' }),
  T('mordvin-religion', 'Religión tradicional mordvina', 'north-eurasia', -500, null, 'uralic-religions', .51, 'urálica', { kind: 'folk' }),
  T('tengrism', 'Tengrismo', 'north-eurasia', -1000, null, 'siberian-ritual', .6, 'altaica y esteparia', { kind: 'folk', importance: 1 }),
  T('turkic-religion', 'Religiones túrquicas antiguas', 'north-eurasia', -500, 1400, 'tengrism', .66, 'altaica y esteparia', { kind: 'folk' }),
  T('mongolian-religion', 'Religión tradicional mongola', 'north-eurasia', -500, null, 'tengrism', .73, 'altaica y esteparia', { kind: 'folk' }),
  T('burkhanism', 'Burjanismo', 'north-eurasia', 1904, null, 'tengrism', .8, 'altaica y esteparia', { kind: 'movement', relation: 'reform' }),
  T('yellow-shamanism', 'Chamanismo amarillo', 'north-eurasia', 1600, null, 'mongolian-religion', .87, 'sincretismo mongol-budista', { kind: 'movement', relation: 'syncretism' }),
  T('siberian-buddhism', 'Budismo de Siberia y Mongolia', 'north-eurasia', 1200, null, 'tibetan-buddhism', .94, 'budismo', { kind: 'movement', relation: 'migration' }),

  // Asia meridional
  T('south-asian-prehistory', 'Complejos rituales del sur de Asia', 'south-asia', -30000, -7000, null, .05, 'prehistoria ritual', { kind: 'substrate', verifier: false, importance: 1 }),
  T('indus-religion', 'Tradiciones del valle del Indo', 'south-asia', -3300, -1300, 'south-asian-prehistory', .12, 'surasiática antigua', { kind: 'ritual-complex', verifier: false, importance: 1 }),
  T('vedic-religion', 'Religión védica', 'south-asia', -1500, -500, null, .2, 'indoaria', { importance: 1 }),
  T('brahmanism', 'Brahmanismo', 'south-asia', -900, 400, 'vedic-religion', .27, 'indoaria', { kind: 'movement', relation: 'reform' }),
  T('hinduism', 'Hinduismo', 'south-asia', -500, null, 'brahmanism', .34, 'dhármica', { relation: 'reform', importance: 1, confidence: 'high' }),
  T('vaishnavism', 'Visnuismo', 'south-asia', -300, null, 'hinduism', .4, 'hinduismo', { kind: 'movement', importance: 1 }),
  T('shaivism', 'Shivaísmo', 'south-asia', -200, null, 'hinduism', .46, 'hinduismo', { kind: 'movement', importance: 1 }),
  T('shaktism', 'Shaktismo', 'south-asia', 300, null, 'hinduism', .52, 'hinduismo', { kind: 'movement' }),
  T('smartism', 'Smartismo', 'south-asia', 800, null, 'hinduism', .57, 'hinduismo', { kind: 'movement' }),
  T('vedanta', 'Vedānta', 'south-asia', 200, null, 'brahmanism', .62, 'filosofías dhármicas', { kind: 'philosophy', relation: 'reform' }),
  T('yoga-traditions', 'Tradiciones del yoga', 'south-asia', -500, null, 'brahmanism', .67, 'filosofías dhármicas', { kind: 'philosophy', relation: 'context' }),
  T('sramana', 'Movimientos śramaṇa', 'south-asia', -800, 500, 'vedic-religion', .72, 'dhármica', { kind: 'movement', relation: 'context', importance: 1 }),
  T('jainism', 'Jainismo', 'south-asia', -600, null, 'sramana', .76, 'dhármica', { relation: 'reform', importance: 1 }),
  T('digambara', 'Digambara', 'south-asia', 100, null, 'jainism', .8, 'jainismo', { kind: 'denomination' }),
  T('svetambara', 'Śvētāmbara', 'south-asia', 100, null, 'jainism', .84, 'jainismo', { kind: 'denomination' }),
  T('buddhism', 'Budismo', 'south-asia', -500, null, 'sramana', .88, 'dhármica', { relation: 'reform', importance: 1, confidence: 'high' }),
  T('theravada', 'Theravāda', 'south-asia', -250, null, 'buddhism', .92, 'budismo', { kind: 'denomination', importance: 1 }),
  T('mahayana', 'Mahāyāna', 'south-asia', -100, null, 'buddhism', .96, 'budismo', { kind: 'movement', importance: 1 }),
  T('vajrayana', 'Vajrayāna', 'south-asia', 600, null, 'mahayana', .99, 'budismo', { kind: 'movement', relation: 'reform', importance: 1 }),
  T('sikhism', 'Sijismo', 'south-asia', 1469, null, 'hinduism', .08, 'sijismo', { relation: 'context', importance: 1, precision: 'year', confidence: 'high' }),
  T('sant-mat', 'Sant Mat', 'south-asia', 1200, null, 'hinduism', .14, 'devoción surasiática', { kind: 'movement', relation: 'reform' }),
  T('lingayatism', 'Lingayatismo', 'south-asia', 1100, null, 'shaivism', .22, 'hinduismo', { kind: 'movement', relation: 'reform' }),
  T('gaudiya-vaishnavism', 'Visnuismo gauḍīya', 'south-asia', 1500, null, 'vaishnavism', .3, 'hinduismo', { kind: 'movement', relation: 'reform' }),

  // Asia central y oriental
  T('east-asian-prehistory', 'Rituales prehistóricos de Asia oriental', 'east-asia', -30000, -5000, null, .05, 'prehistoria ritual', { kind: 'substrate', verifier: false, importance: 1 }),
  T('shang-religion', 'Religión de Shang', 'east-asia', -1600, -1046, 'east-asian-prehistory', .12, 'china antigua', { importance: 1 }),
  T('zhou-religion', 'Religión ritual de Zhou', 'east-asia', -1046, -256, 'shang-religion', .2, 'china antigua', { relation: 'reform' }),
  T('chinese-folk', 'Religión tradicional china', 'east-asia', -1500, null, 'shang-religion', .28, 'china', { kind: 'folk', importance: 1 }),
  T('confucianism', 'Confucianismo', 'east-asia', -500, null, 'zhou-religion', .36, 'china', { kind: 'philosophy', relation: 'reform', importance: 1 }),
  T('neo-confucianism', 'Neoconfucianismo', 'east-asia', 900, null, 'confucianism', .42, 'china', { kind: 'movement', relation: 'reform' }),
  T('taoism', 'Taoísmo', 'east-asia', -400, null, 'zhou-religion', .48, 'china', { kind: 'religion', relation: 'reform', importance: 1 }),
  T('celestial-masters', 'Camino de los Maestros Celestiales', 'east-asia', 142, null, 'taoism', .54, 'taoísmo', { kind: 'movement', relation: 'reform' }),
  T('quanzhen', 'Escuela Quanzhen', 'east-asia', 1159, null, 'taoism', .59, 'taoísmo', { kind: 'movement', relation: 'reform' }),
  T('chinese-buddhism', 'Budismo chino', 'east-asia', 100, null, 'mahayana', .65, 'budismo', { kind: 'movement', relation: 'migration', importance: 1 }),
  T('chan-buddhism', 'Budismo Chan', 'east-asia', 500, null, 'chinese-buddhism', .7, 'budismo', { kind: 'movement', relation: 'reform' }),
  T('pure-land', 'Budismo de la Tierra Pura', 'east-asia', 400, null, 'chinese-buddhism', .75, 'budismo', { kind: 'movement', relation: 'reform' }),
  T('tibetan-buddhism', 'Budismo tibetano', 'east-asia', 700, null, 'vajrayana', .8, 'budismo', { kind: 'movement', relation: 'migration', importance: 1 }),
  T('bon', 'Bön', 'east-asia', 700, null, null, .84, 'tibetana', { precision: 'disputed', confidence: 'medium' }),
  T('korean-shamanism', 'Muismo coreano', 'east-asia', -1000, null, 'east-asian-prehistory', .88, 'coreana', { kind: 'folk' }),
  T('korean-buddhism', 'Budismo coreano', 'east-asia', 372, null, 'chinese-buddhism', .92, 'budismo', { kind: 'movement', relation: 'migration' }),
  T('shinto', 'Sintoísmo', 'east-asia', 500, null, 'east-asian-prehistory', .96, 'japonesa', { kind: 'folk', importance: 1, precision: 'disputed' }),
  T('japanese-buddhism', 'Budismo japonés', 'east-asia', 552, null, 'chinese-buddhism', .99, 'budismo', { kind: 'movement', relation: 'migration' }),
  T('zen', 'Zen', 'east-asia', 1200, null, 'chan-buddhism', .72, 'budismo', { kind: 'movement', relation: 'migration', importance: 1 }),
  T('nichiren', 'Budismo Nichiren', 'east-asia', 1253, null, 'japanese-buddhism', .98, 'budismo', { kind: 'movement', relation: 'reform' }),

  // Sudeste asiático
  T('se-asian-prehistory', 'Tradiciones prehistóricas del Sudeste Asiático', 'southeast-asia', -40000, -3000, null, .07, 'prehistoria ritual', { kind: 'substrate', verifier: false, importance: 1 }),
  T('austroasiatic-religions', 'Religiones austroasiáticas', 'southeast-asia', -3000, null, 'se-asian-prehistory', .16, 'austroasiática', { kind: 'folk', relation: 'migration' }),
  T('austronesian-religions', 'Religiones austronesias', 'southeast-asia', -2500, null, 'se-asian-prehistory', .25, 'austronesia', { kind: 'folk', relation: 'migration', importance: 1 }),
  T('vietnamese-folk', 'Religión tradicional vietnamita', 'southeast-asia', -1000, null, 'austroasiatic-religions', .34, 'vietnamita', { kind: 'folk' }),
  T('khmer-religion', 'Religión jemer prebudista', 'southeast-asia', 100, 1400, 'austroasiatic-religions', .42, 'jemer', { kind: 'folk' }),
  T('se-asian-hinduism', 'Hinduismo del Sudeste Asiático', 'southeast-asia', 100, null, 'hinduism', .5, 'hinduismo', { kind: 'movement', relation: 'migration' }),
  T('se-asian-theravada', 'Theravāda del Sudeste Asiático', 'southeast-asia', 1000, null, 'theravada', .58, 'budismo', { kind: 'movement', relation: 'migration', importance: 1 }),
  T('burmese-buddhism', 'Budismo birmano', 'southeast-asia', 500, null, 'theravada', .64, 'budismo', { kind: 'movement', relation: 'migration' }),
  T('thai-buddhism', 'Budismo tailandés', 'southeast-asia', 1200, null, 'theravada', .7, 'budismo', { kind: 'movement', relation: 'migration' }),
  T('indonesian-islam', 'Islam de Indonesia', 'southeast-asia', 1200, null, 'islam', .77, 'islam', { kind: 'movement', relation: 'migration', importance: 1 }),
  T('abangan', 'Abangan', 'southeast-asia', 1500, null, 'indonesian-islam', .82, 'sincretismo javanés', { kind: 'folk', relation: 'syncretism' }),
  T('balinese-hinduism', 'Hinduismo balinés', 'southeast-asia', 1000, null, 'se-asian-hinduism', .87, 'hinduismo', { kind: 'movement', relation: 'syncretism' }),
  T('cao-dai', 'Caodaísmo', 'southeast-asia', 1926, null, 'vietnamese-folk', .92, 'nuevo movimiento religioso', { kind: 'movement', relation: 'syncretism', importance: 1 }),
  T('hoa-hao', 'Hòa Hảo', 'southeast-asia', 1939, null, 'vietnamese-folk', .97, 'budismo', { kind: 'movement', relation: 'reform' }),

  // Oceanía
  T('sahul-ritual', 'Tradiciones rituales de Sahul', 'oceania', -60000, null, null, .1, 'sahul', { kind: 'substrate', verifier: false, importance: 1 }),
  T('aboriginal-australian', 'Religiones aborígenes australianas', 'oceania', -50000, null, 'sahul-ritual', .22, 'australiana indígena', { kind: 'folk', relation: 'context', importance: 1 }),
  T('papuan-religions', 'Religiones papúes', 'oceania', -40000, null, 'sahul-ritual', .35, 'papú', { kind: 'folk', relation: 'context', importance: 1 }),
  T('melanesian-religions', 'Religiones melanesias', 'oceania', -3000, null, 'austronesian-religions', .48, 'melanesia', { kind: 'folk', relation: 'migration' }),
  T('arnhem-land', 'Tradiciones de la Tierra de Arnhem', 'oceania', -20000, null, 'aboriginal-australian', .58, 'australiana indígena', { kind: 'folk' }),
  T('rainbow-serpent', 'Complejos de la Serpiente Arcoíris', 'oceania', -6000, null, 'aboriginal-australian', .68, 'australiana indígena', { kind: 'ritual-complex', confidence: 'low' }),
  T('cargo-cults', 'Cultos cargo', 'oceania', 1885, null, 'melanesian-religions', .8, 'nuevo movimiento religioso', { kind: 'movement', relation: 'syncretism', importance: 1 }),
  T('john-frum', 'Movimiento John Frum', 'oceania', 1930, null, 'cargo-cults', .9, 'nuevo movimiento religioso', { kind: 'movement', relation: 'reform' }),

  // Pacífico
  T('lapita-religion', 'Tradiciones Lapita', 'pacific', -1600, -500, 'austronesian-religions', .08, 'austronesia', { kind: 'ritual-complex', relation: 'migration', importance: 1 }),
  T('polynesian-religions', 'Religiones polinesias', 'pacific', -500, null, 'lapita-religion', .22, 'polinesia', { kind: 'folk', relation: 'migration', importance: 1 }),
  T('micronesian-religions', 'Religiones micronesias', 'pacific', -500, null, 'lapita-religion', .34, 'micronesia', { kind: 'folk', relation: 'migration' }),
  T('hawaiian-religion', 'Religión hawaiana', 'pacific', 500, null, 'polynesian-religions', .46, 'polinesia', { kind: 'folk' }),
  T('maori-religion', 'Religión maorí', 'pacific', 1250, null, 'polynesian-religions', .58, 'polinesia', { kind: 'folk' }),
  T('samoan-religion', 'Religión tradicional samoana', 'pacific', 500, null, 'polynesian-religions', .69, 'polinesia', { kind: 'folk' }),
  T('tongan-religion', 'Religión tradicional tongana', 'pacific', 500, null, 'polynesian-religions', .79, 'polinesia', { kind: 'folk' }),
  T('rapa-nui-religion', 'Religión rapanui', 'pacific', 1000, null, 'polynesian-religions', .9, 'polinesia', { kind: 'folk' }),
  T('ringatu', 'Ringatū', 'pacific', 1868, null, 'maori-religion', .96, 'maorí-cristiana', { kind: 'movement', relation: 'syncretism' }),

  // Norteamérica
  T('beringian-ritual', 'Tradiciones de los primeros poblamientos americanos', 'north-america', -20000, -8000, null, .06, 'prehistoria americana', { kind: 'substrate', verifier: false, importance: 1 }),
  T('native-north-american', 'Tradiciones indígenas norteamericanas', 'north-america', -10000, null, 'beringian-ritual', .14, 'indígena norteamericana', { kind: 'folk', relation: 'context', importance: 1 }),
  T('inuit-religion', 'Religión inuit', 'north-america', -2500, null, 'native-north-american', .22, 'ártico', { kind: 'folk' }),
  T('dene-religions', 'Tradiciones dené', 'north-america', -4000, null, 'native-north-american', .3, 'na-dené', { kind: 'folk' }),
  T('northwest-coast', 'Tradiciones de la costa noroeste', 'north-america', -3000, null, 'native-north-american', .38, 'costa noroeste', { kind: 'folk' }),
  T('plains-religions', 'Tradiciones de las Grandes Llanuras', 'north-america', -1000, null, 'native-north-american', .46, 'llanuras', { kind: 'folk' }),
  T('iroquois-religion', 'Religión haudenosaunee', 'north-america', 1000, null, 'native-north-american', .54, 'bosques orientales', { kind: 'folk', aliases: ['Iroquois religion'] }),
  T('cherokee-religion', 'Religión cherokee', 'north-america', 1000, null, 'native-north-american', .62, 'sudeste norteamericano', { kind: 'folk' }),
  T('pueblo-religions', 'Religiones pueblo', 'north-america', 500, null, 'native-north-american', .7, 'suroeste norteamericano', { kind: 'folk' }),
  T('navajo-religion', 'Religión diné', 'north-america', 1200, null, 'dene-religions', .76, 'suroeste norteamericano', { kind: 'folk', aliases: ['Navajo religion'] }),
  T('midewiwin', 'Midewiwin', 'north-america', 1500, null, 'native-north-american', .82, 'anishinaabe', { kind: 'movement' }),
  T('peyote-religion', 'Religión del peyote', 'north-america', 1700, null, 'native-north-american', .87, 'panindígena', { kind: 'movement', relation: 'syncretism' }),
  T('native-american-church', 'Native American Church', 'north-america', 1880, null, 'peyote-religion', .92, 'panindígena', { kind: 'movement', relation: 'reform', importance: 1 }),
  T('ghost-dance', 'Danza de los Espíritus', 'north-america', 1869, 1890, 'native-north-american', .96, 'panindígena', { kind: 'movement', relation: 'reform' }),

  // Mesoamérica
  T('mesoamerican-prehistory', 'Complejos rituales mesoamericanos tempranos', 'mesoamerica', -8000, -2000, 'beringian-ritual', .07, 'prehistoria mesoamericana', { kind: 'substrate', verifier: false, relation: 'migration', importance: 1 }),
  T('olmec-religion', 'Religión olmeca', 'mesoamerica', -1500, -400, 'mesoamerican-prehistory', .18, 'mesoamericana', { importance: 1 }),
  T('zapotec-religion', 'Religión zapoteca', 'mesoamerica', -700, null, 'mesoamerican-prehistory', .29, 'mesoamericana', { kind: 'folk' }),
  T('teotihuacan-religion', 'Religión de Teotihuacan', 'mesoamerica', -100, 650, 'mesoamerican-prehistory', .4, 'mesoamericana', { importance: 1 }),
  T('maya', 'Religión maya', 'mesoamerica', -2000, null, 'mesoamerican-prehistory', .51, 'mesoamericana', { kind: 'folk', importance: 1 }),
  T('toltec-religion', 'Religión tolteca', 'mesoamerica', 600, 1200, 'teotihuacan-religion', .62, 'mesoamericana'),
  T('mixtec-religion', 'Religión mixteca', 'mesoamerica', 500, null, 'mesoamerican-prehistory', .72, 'mesoamericana', { kind: 'folk' }),
  T('aztec', 'Religión mexica', 'mesoamerica', 1300, 1521, 'toltec-religion', .82, 'mesoamericana', { aliases: ['Religión azteca'], importance: 1 }),
  T('mayan-syncretism', 'Religión maya-cristiana', 'mesoamerica', 1524, null, 'maya', .91, 'mesoamericana-cristiana', { kind: 'folk', relation: 'syncretism' }),
  T('mexican-folk-catholicism', 'Catolicismo popular mexicano', 'mesoamerica', 1521, null, 'catholicism', .97, 'cristianismo popular', { kind: 'folk', relation: 'syncretism' }),

  // Sudamérica
  T('south-american-prehistory', 'Tradiciones de los primeros poblamientos sudamericanos', 'south-america', -16000, -5000, 'beringian-ritual', .06, 'prehistoria americana', { kind: 'substrate', verifier: false, relation: 'migration', importance: 1 }),
  T('andean-religions', 'Religiones andinas', 'south-america', -5000, null, 'south-american-prehistory', .16, 'andina', { kind: 'folk', importance: 1 }),
  T('caral-religion', 'Complejo ritual de Caral', 'south-america', -3000, -1800, 'andean-religions', .24, 'andina', { kind: 'ritual-complex', verifier: false }),
  T('chavin-religion', 'Religión Chavín', 'south-america', -900, -200, 'andean-religions', .32, 'andina'),
  T('moche-religion', 'Religión moche', 'south-america', 100, 800, 'andean-religions', .4, 'andina'),
  T('tiwanaku-religion', 'Religión de Tiwanaku', 'south-america', 500, 1000, 'andean-religions', .48, 'andina'),
  T('inca', 'Religión inca', 'south-america', 1200, 1572, 'andean-religions', .56, 'andina', { importance: 1 }),
  T('amazonian-religions', 'Religiones amazónicas', 'south-america', -5000, null, 'south-american-prehistory', .66, 'amazónica', { kind: 'folk', importance: 1 }),
  T('tupi-guarani', 'Religiones tupí-guaraníes', 'south-america', -1000, null, 'amazonian-religions', .74, 'amazónica', { kind: 'folk' }),
  T('mapuche-religion', 'Religión mapuche', 'south-america', -500, null, 'south-american-prehistory', .82, 'cono sur', { kind: 'folk' }),
  T('andean-catholicism', 'Catolicismo andino', 'south-america', 1532, null, 'andean-religions', .9, 'andina-cristiana', { kind: 'folk', relation: 'syncretism', importance: 1 }),
  T('candomble', 'Candomblé', 'south-america', 1800, null, 'african-diasporic', .96, 'afrodiaspórica', { kind: 'movement', relation: 'syncretism', importance: 1 })
];

const events = [
  ['symbolic-behaviour', 'Primeras evidencias ampliamente debatidas de simbolismo', -120000, ['africa'], 'archaeology', 'Pigmentos, enterramientos y objetos sugieren conducta simbólica; no permiten identificar una religión concreta.', 'low'],
  ['out-of-africa', 'Expansiones de Homo sapiens fuera de África', -70000, ['africa', 'middle-east', 'south-asia', 'east-asia'], 'migration', 'Procesos migratorios prolongados que llevaron poblaciones y repertorios culturales a otros continentes.', 'medium'],
  ['sahul-settlement', 'Poblamiento de Sahul', -60000, ['oceania'], 'migration', 'Llegada humana a Australia y Nueva Guinea en cronologías todavía afinadas por la arqueología.', 'medium'],
  ['upper-paleolithic-art', 'Expansión del arte paleolítico conservado', -40000, ['europe', 'north-eurasia', 'east-asia'], 'archaeology', 'Aumentan las evidencias de arte figurativo, ornamentos y espacios ritualizados.', 'high'],
  ['americas-settlement', 'Poblamiento de las Américas', -20000, ['north-america', 'mesoamerica', 'south-america'], 'migration', 'Múltiples rutas y oleadas; la cronología exacta sigue en revisión.', 'medium'],
  ['neolithic-transition', 'Transiciones neolíticas', -10000, ['middle-east', 'europe', 'south-asia', 'east-asia'], 'exchange', 'Sedentarización, agricultura y nuevas formas de memoria ritual, territorialidad y especialización.', 'high'],
  ['austronesian-expansion', 'Expansiones austronesias', -2500, ['southeast-asia', 'oceania', 'pacific'], 'migration', 'Redes marítimas trasladan lenguas, tecnologías y prácticas rituales por el Índico y el Pacífico.', 'high'],
  ['indo-european-dispersals', 'Dispersiones indoeuropeas', -3000, ['europe', 'middle-east', 'south-asia', 'north-eurasia'], 'migration', 'Procesos lingüísticos y culturales de larga duración; no equivalen a una religión única.', 'medium'],
  ['axial-age', 'Transformaciones del llamado “periodo axial”', -500, ['europe', 'middle-east', 'south-asia', 'east-asia'], 'exchange', 'Etiqueta comparativa para cambios intelectuales y religiosos no simultáneos ni causalmente unitarios.', 'medium'],
  ['silk-roads', 'Redes de la Ruta de la Seda', -100, ['middle-east', 'north-eurasia', 'south-asia', 'east-asia'], 'exchange', 'Mercaderes, monjes, estados y diásporas conectan tradiciones a través de Asia.', 'high'],
  ['christian-state', 'Cristianización del Imperio romano', 380, ['europe', 'middle-east', 'africa'], 'state', 'El cristianismo niceno adquiere respaldo imperial; otras corrientes continúan o son marginadas.', 'high'],
  ['buddhism-east', 'Expansión del budismo por Asia', 200, ['south-asia', 'east-asia', 'southeast-asia', 'north-eurasia'], 'exchange', 'Traducción, patronazgo y adaptación generan escuelas regionales diferentes.', 'high'],
  ['islamic-expansion', 'Expansiones islámicas', 650, ['middle-east', 'africa', 'south-asia', 'north-eurasia'], 'state', 'Conquistas, comercio, erudición y redes sufíes producen ritmos de islamización distintos.', 'high'],
  ['great-schism', 'Cisma entre Roma y Constantinopla', 1054, ['europe', 'middle-east'], 'conflict', 'Fecha convencional para una separación acumulativa, no ruptura instantánea total.', 'high'],
  ['printing-reformation', 'Imprenta y Reforma europea', 1517, ['europe'], 'text', 'La controversia religiosa se entrelaza con imprenta, estados, guerras y reformas institucionales.', 'high'],
  ['atlantic-contact', 'Conquista y colonización europea de América', 1492, ['europe', 'north-america', 'mesoamerica', 'south-america'], 'contact', 'Violencia, evangelización, resistencia y traducción transforman las tradiciones americanas.', 'high'],
  ['slave-trade', 'Trata transatlántica de personas esclavizadas', 1500, ['africa', 'north-america', 'south-america'], 'migration', 'Desplazamiento forzado que contribuye a nuevas religiones afrodiaspóricas bajo condiciones de violencia extrema.', 'high'],
  ['colonial-pacific', 'Colonización y misiones en Oceanía y el Pacífico', 1770, ['oceania', 'pacific'], 'contact', 'Misiones, estados coloniales y respuestas indígenas alteran instituciones y repertorios rituales.', 'high'],
  ['modern-revivals', 'Reavivamientos y reconstruccionismos modernos', 1850, ['europe', 'north-eurasia', 'north-america', 'east-asia'], 'exchange', 'Nacionalismo, romanticismo, colonialismo y globalización favorecen nuevas formulaciones identitarias.', 'high'],
  ['global-religions', 'Globalización religiosa contemporánea', 1950, regions.map((region) => region.id), 'exchange', 'Migraciones, medios, descolonización e internet aceleran la circulación y recomposición de tradiciones.', 'high']
].map(([id, title, year, regionIds, kind, summary, confidence]) => ({ id, title, year, regionIds, kind, summary, confidence }));

const relations = [
  ['judaism-zoroastrianism', 'zoroastrianism', 'judaism', 'influence', 'low', 'Se han propuesto influencias durante y después del periodo aqueménida; la dirección y el alcance exactos son debatidos.'],
  ['manichaean-synthesis', 'christianity', 'manichaeism', 'syncretism', 'high', 'El maniqueísmo integró elementos cristianos junto con repertorios iranios y otras tradiciones.'],
  ['buddhism-bon', 'bon', 'tibetan-buddhism', 'syncretism', 'medium', 'La interacción histórica entre Bön y budismo tibetano produjo préstamos y reformulaciones mutuas.'],
  ['confucian-buddhist', 'chinese-buddhism', 'neo-confucianism', 'influence', 'high', 'El neoconfucianismo respondió también a problemas y vocabularios desarrollados en diálogo con budismo y taoísmo.'],
  ['taoist-folk', 'chinese-folk', 'taoism', 'context', 'high', 'El taoísmo institucional y los cultos locales se solapan sin ser idénticos.'],
  ['shinto-buddhist', 'japanese-buddhism', 'shinto', 'syncretism', 'high', 'Durante siglos kami y budas se interpretaron mediante complejos sistemas combinados.'],
  ['hindu-buddhist-sea', 'se-asian-hinduism', 'se-asian-theravada', 'context', 'high', 'Reinos y comunidades del Sudeste Asiático combinaron o sucedieron repertorios hinduistas y budistas de modos regionales.'],
  ['africa-candomble', 'yoruba', 'candomble', 'migration', 'high', 'Las tradiciones yoruba y otras matrices africanas participaron en la formación del Candomblé bajo la diáspora forzada.'],
  ['catholic-mesoamerican', 'mexican-folk-catholicism', 'mayan-syncretism', 'context', 'high', 'Ambas formaciones combinan repertorios cristianos e indígenas sin constituir una sola tradición.'],
  ['andean-inca', 'chavin-religion', 'inca', 'influence', 'medium', 'Motivos y prácticas andinas de larga duración preceden al imperio inca, pero no forman una línea institucional simple.'],
  ['steppe-buddhism', 'tengrism', 'siberian-buddhism', 'context', 'medium', 'La adopción del budismo en sociedades de la estepa convivió con prácticas anteriores.'],
  ['sikh-context', 'sant-mat', 'sikhism', 'context', 'high', 'El sijismo surgió en un paisaje punjabí con corrientes devocionales, islámicas e hinduistas; no se reduce a ninguna de ellas.']
].map(([id, sourceId, targetId, kind, confidence, note]) => ({ id, sourceId, targetId, kind, confidence, note }));

const ids = new Set(traditions.map((entry) => entry.id));
for (const entry of traditions) {
  if (entry.parentId && !ids.has(entry.parentId)) throw new Error(`Padre inexistente ${entry.parentId} en ${entry.id}`);
  if (!regions.some((region) => region.id === entry.regionId)) throw new Error(`Región inexistente ${entry.regionId}`);
}
for (const relation of relations) {
  if (!ids.has(relation.sourceId) || !ids.has(relation.targetId)) throw new Error(`Relación inválida ${relation.id}`);
}

const atlas = {
  metadata: {
    generatedAt: '2026-07-17T00:00:00.000Z',
    version: '0.1.0',
    presentYear: PRESENT,
    referenceNotice: 'Cronología inicial contrastada con las dos infografías aportadas y con el listado verificador de Wikipedia. Las relaciones de tipo influencia o contexto no equivalen a descendencia.'
  },
  regions,
  traditions,
  events,
  relations
};

await mkdir(dirname(output), { recursive: true });
await writeFile(output, `${JSON.stringify(atlas, null, 2)}\n`, 'utf8');
console.log(`Atlas generado: ${traditions.length} tradiciones, ${relations.length} relaciones transversales y ${events.length} acontecimientos.`);
