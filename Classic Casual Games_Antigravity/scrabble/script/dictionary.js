(function () {
  "use strict";

  /* ── State ────────────────────────────────────────────── */
  let fullSet = null;   // Set of ALL valid words (loaded from file)
  let aiWords = [];     // Subset of shorter words for AI search
  let ready = false;

  /* ── Compact fallback list (used if fetch fails) ─────── */
  const FALLBACK = [
    "AA","AB","AD","AE","AG","AH","AI","AL","AM","AN","AR","AS","AT","AW","AX","AY",
    "BA","BE","BI","BO","BY","DA","DE","DO","ED","EF","EH","EL","EM","EN","ER","ES","ET","EX",
    "FA","GO","HA","HE","HI","HO","ID","IF","IN","IS","IT","JO","KA","LA","LI","LO",
    "MA","ME","MI","MO","MU","MY","NA","NE","NO","NU","OD","OE","OF","OH","OK","OM","ON","OP",
    "OR","OS","OW","OX","OY","PA","PE","PI","RE","SH","SI","SO","TA","TI","TO","UH","UM","UN",
    "UP","US","UT","WE","WO","XI","YA","YE","ZA",
    "ACE","ACT","ADD","AGE","AGO","AID","AIM","AIR","ALE","ALL","AND","ANT","APE","ARC","ARE","ARK",
    "ARM","ART","ATE","AWE","AXE","BAD","BAG","BAN","BAR","BAT","BAY","BED","BET","BIG","BIT","BOW",
    "BOX","BOY","BUD","BUG","BUN","BUS","BUT","BUY","CAB","CAN","CAP","CAR","CAT","COP","COT","COW",
    "CRY","CUB","CUP","CUR","CUT","DAD","DAM","DAY","DEN","DEW","DID","DIG","DIM","DIP","DOC","DOG",
    "DOT","DRY","DUB","DUE","DUG","DUN","DUO","DYE","EAR","EAT","EEL","EGG","ELF","ELK","ELM","EMU",
    "END","ERA","EVE","EWE","EYE","FAN","FAR","FAT","FAX","FED","FEW","FIG","FIN","FIR","FIT","FIX",
    "FLY","FOB","FOE","FOG","FOR","FOX","FRY","FUN","FUR","GAB","GAG","GAP","GAS","GEL","GEM","GET",
    "GIG","GIN","GNU","GOB","GOD","GOT","GUM","GUN","GUT","GUY","GYM","HAD","HAM","HAS","HAT","HAY",
    "HEN","HER","HEW","HEX","HID","HIM","HIP","HIS","HIT","HOB","HOG","HOP","HOT","HOW","HUB","HUE",
    "HUG","HUM","HUT","ICE","ICY","ILL","IMP","INK","INN","ION","IRE","IRK","ITS","IVY","JAB","JAM",
    "JAR","JAW","JAY","JET","JIG","JOB","JOG","JOT","JOY","JUG","JUT","KEG","KEY","KID","KIN","KIT",
    "LAB","LAD","LAG","LAP","LAW","LAX","LAY","LEA","LED","LEG","LET","LID","LIE","LIP","LIT","LOG",
    "LOT","LOW","LUG","MAD","MAN","MAP","MAR","MAT","MAW","MAX","MAY","MEN","MET","MID","MIX","MOB",
    "MOD","MOM","MOP","MOW","MUD","MUG","MUM","NAB","NAG","NAP","NAY","NET","NEW","NIB","NIL","NIT",
    "NOD","NOR","NOT","NOW","NUB","NUN","NUT","OAF","OAK","OAR","OAT","ODD","ODE","OFF","OFT","OHM",
    "OIL","OLD","ONE","OPT","ORB","ORE","OUR","OUT","OWE","OWL","OWN","PAD","PAL","PAN","PAR","PAT",
    "PAW","PAY","PEA","PEG","PEN","PEP","PER","PET","PEW","PIE","PIG","PIN","PIT","PLY","POD","POP",
    "POT","PRO","PRY","PUB","PUG","PUN","PUP","PUS","PUT","RAG","RAM","RAN","RAP","RAT","RAW","RAY",
    "RED","REF","RIB","RID","RIG","RIM","RIP","ROB","ROD","ROT","ROW","RUB","RUG","RUM","RUN","RUT",
    "RYE","SAD","SAG","SAP","SAT","SAW","SAY","SEA","SET","SEW","SHE","SHY","SIN","SIP","SIR","SIS",
    "SIT","SIX","SKI","SKY","SLY","SOB","SOD","SON","SOP","SOT","SOW","SOY","SPA","SPY","STY","SUB",
    "SUM","SUN","SUP","TAB","TAD","TAG","TAN","TAP","TAR","TAT","TAX","TEA","TEN","THE","TIE","TIN",
    "TIP","TOE","TON","TOO","TOP","TOT","TOW","TOY","TRY","TUB","TUG","TWO","URN","USE","VAN","VAT",
    "VET","VEX","VIA","VIE","VOW","WAD","WAG","WAR","WAS","WAX","WAY","WEB","WED","WET","WHO","WHY",
    "WIG","WIN","WIT","WOE","WOK","WON","WOO","WOW","YAK","YAM","YAP","YAW","YEA","YES","YET","YEW",
    "YOU","ZAP","ZEN","ZIP","ZIT","ZOO",
    "ABLE","ACHE","ACID","ACRE","AGED","AIDE","ALSO","ARCH","AREA","ARMY","BACK","BAKE","BALD","BALL",
    "BAND","BANE","BANK","BARE","BARK","BARN","BASE","BATH","BEAD","BEAM","BEAN","BEAR","BEAT","BEEF",
    "BEEN","BEER","BELL","BELT","BEND","BENT","BEST","BIKE","BILL","BIND","BIRD","BITE","BLOW","BLUE",
    "BLUR","BOAR","BOAT","BODY","BOLD","BOLT","BOMB","BOND","BONE","BOOK","BOOM","BOOT","BORE","BORN",
    "BOSS","BOTH","BOWL","BULK","BULL","BUMP","BURN","BUSH","BUSY","BUZZ","CAFE","CAGE","CAKE","CALF",
    "CALL","CALM","CAME","CAMP","CANE","CAPE","CARD","CARE","CARP","CART","CASE","CASH","CAST","CAVE",
    "CELL","CHAT","CHIP","CHOP","CITE","CITY","CLAD","CLAM","CLAP","CLAW","CLAY","CLIP","CLOG","CLUB",
    "CLUE","COAL","COAT","CODE","COIL","COIN","COLD","COLT","COMB","COME","CONE","COOK","COOL","COPE",
    "COPY","CORD","CORE","CORK","CORN","COST","COUP","COVE","COZY","CRAB","CREW","CROP","CROW","CUBE",
    "CULT","CURB","CURE","CURL","CUTE","DALE","DAME","DAMP","DARE","DARK","DARN","DART","DASH","DATA",
    "DATE","DAWN","DEAD","DEAF","DEAL","DEAR","DEBT","DECK","DEED","DEEM","DEEP","DEER","DEMO","DENY",
    "DESK","DIAL","DICE","DIED","DIET","DIME","DINE","DIRT","DISC","DISH","DOCK","DOES","DOLL","DOME",
    "DONE","DOOM","DOOR","DOSE","DOWN","DOZE","DRAG","DRAW","DREW","DROP","DRUM","DUAL","DUCK","DUDE",
    "DUEL","DUKE","DULL","DUMB","DUMP","DUNE","DUNK","DUSK","DUST","DUTY","EACH","EARL","EARN","EASE",
    "EAST","EASY","EDGE","EDIT","ELSE","EMIT","EVEN","EVER","EVIL","EXAM","EXIT","EYED","FACE","FACT",
    "FADE","FAIL","FAIR","FAKE","FALL","FAME","FANG","FARE","FARM","FAST","FATE","FAWN","FEAR","FEAT",
    "FEED","FEEL","FEET","FELL","FELT","FERN","FILE","FILL","FILM","FIND","FINE","FIRE","FIRM","FISH",
    "FIST","FIVE","FLAG","FLAP","FLAT","FLAW","FLEA","FLED","FLEE","FLEW","FLIP","FLIT","FLOG","FLOP",
    "FLOW","FOAM","FOAL","FOIL","FOLD","FOLK","FOND","FONT","FOOD","FOOL","FOOT","FORD","FORE","FORK",
    "FORM","FORT","FOUL","FOUR","FREE","FROG","FROM","FUEL","FULL","FUME","FUND","FUNK","FURY","FUSE",
    "FUSS","FUZZ","GALE","GALL","GAME","GANG","GAPE","GATE","GAVE","GAZE","GEAR","GENE","GIFT","GILD",
    "GIST","GIVE","GLAD","GLEN","GLIB","GLOW","GLUE","GLUT","GNAT","GNAW","GOAT","GOES","GOLD","GOLF",
    "GONE","GOOD","GORE","GRAB","GRAM","GRAY","GREW","GRID","GRIM","GRIN","GRIP","GRIT","GROW","GRUB",
    "GULF","GULL","GULP","GUST","HACK","HAIL","HAIR","HALE","HALF","HALL","HALT","HAND","HANG","HARE",
    "HARM","HARP","HASH","HATE","HAUL","HAVE","HAZE","HAZY","HEAD","HEAL","HEAP","HEAR","HEAT","HEED",
    "HEEL","HELD","HELM","HELP","HEMP","HERB","HERD","HERE","HERO","HIDE","HIGH","HIKE","HILL","HILT",
    "HIND","HINT","HIRE","HISS","HIVE","HOLD","HOLE","HOME","HONE","HOOD","HOOK","HOOP","HOPE","HORN",
    "HOSE","HOST","HOUR","HOWL","HUGE","HULL","HUMP","HUNG","HUNT","HURL","HURT","HUSH","HYMN","ICON",
    "IDEA","IDLE","INCH","INTO","IRON","ISLE","ITEM","JACK","JADE","JAIL","JAZZ","JEAN","JEST","JOIN",
    "JOKE","JOLT","JUMP","JUNE","JUNK","JURY","JUST","KALE","KEEN","KEEP","KEPT","KICK","KILL","KILT",
    "KIND","KING","KISS","KITE","KNEE","KNEW","KNIT","KNOB","KNOT","KNOW","LACE","LACK","LAID","LAIR",
    "LAKE","LAMB","LAME","LAMP","LAND","LANE","LARD","LARK","LASH","LASS","LAST","LATE","LAWN","LAZY",
    "LEAD","LEAF","LEAK","LEAN","LEAP","LEFT","LEND","LENS","LENT","LESS","LICK","LIED","LIEU","LIFE",
    "LIFT","LIKE","LILY","LIMB","LIME","LIMP","LINE","LINK","LINT","LION","LIST","LIVE","LOAD","LOAF",
    "LOAM","LOAN","LOCK","LODE","LOFT","LONE","LONG","LOOK","LOOM","LOOP","LOOT","LORD","LORE","LOSE",
    "LOSS","LOST","LOUD","LOVE","LUCK","LULL","LUMP","LUNG","LURE","LURK","LUSH","LUST","MACE","MADE",
    "MAIL","MAIN","MAKE","MALE","MALL","MALT","MANE","MANY","MARE","MARK","MASH","MASK","MASS","MAST",
    "MATE","MAZE","MEAD","MEAL","MEAN","MEAT","MEET","MELD","MELT","MEMO","MEND","MENU","MERE","MESH",
    "MESS","MILD","MILE","MILK","MILL","MIME","MIND","MINE","MINT","MIRE","MISS","MIST","MITE","MOAT",
    "MOCK","MODE","MOLD","MOLE","MONK","MOOD","MOON","MOOR","MOPE","MORE","MORN","MOSS","MOST","MOTH",
    "MOVE","MUCH","MUCK","MULE","MULL","MUSE","MUSH","MUST","MUTE","NAIL","NAME","NAPE","NAVY","NEAR",
    "NEAT","NECK","NEED","NEST","NEWS","NEXT","NICE","NICK","NINE","NODE","NONE","NOON","NORM","NOSE",
    "NOTE","NOUN","NUDE","NULL","NUMB","OATH","OBEY","ODDS","OMEN","OMIT","ONCE","ONLY","ONTO","OOZE",
    "OPAL","OPEN","ORAL","OVEN","OVER","PACE","PACK","PACT","PAGE","PAID","PAIL","PAIN","PAIR","PALE",
    "PALM","PANE","PANT","PARE","PARK","PART","PASS","PAST","PATH","PAVE","PAWN","PEAK","PEAL","PEAR",
    "PEAT","PECK","PEEL","PEER","PELT","PEND","PENT","PERK","PEST","PICK","PIER","PIKE","PILE","PILL",
    "PINE","PINK","PINT","PIPE","PLAN","PLAY","PLEA","PLOT","PLOW","PLOY","PLUG","PLUM","PLUS","POEM",
    "POET","POKE","POLE","POLL","POLO","POND","PONY","POOL","POOR","POPE","PORK","PORT","POSE","POST",
    "POUR","PRAY","PREY","PROD","PROP","PROW","PULL","PULP","PUMP","PUNK","PURE","PUSH","PUTT","QUIT",
    "QUIZ","RACE","RACK","RAFT","RAGE","RAID","RAIL","RAIN","RAKE","RAMP","RANG","RANK","RANT","RARE",
    "RASH","RATE","RAVE","READ","REAL","REAM","REAP","REAR","REED","REEF","REEL","REIN","RELY","REND",
    "RENT","REST","RICH","RIDE","RIFT","RILE","RILL","RIND","RING","RIOT","RISE","RISK","ROAD","ROAM",
    "ROAR","ROBE","ROCK","RODE","ROLE","ROLL","ROOF","ROOM","ROOT","ROPE","ROSE","ROTE","ROUT","ROVE",
    "RUDE","RUIN","RULE","RUMP","RUNG","RUSE","RUSH","RUST","SACK","SAFE","SAGE","SAID","SAIL","SAKE",
    "SALE","SALT","SAME","SAND","SANE","SANG","SANK","SASH","SAVE","SCAN","SEAL","SEAM","SEAR","SEAT",
    "SECT","SEED","SEEK","SEEM","SEEN","SELF","SELL","SEND","SENT","SHED","SHIN","SHIP","SHOE","SHOP",
    "SHOT","SHOW","SHUT","SICK","SIDE","SIFT","SIGH","SIGN","SILK","SILL","SILO","SILT","SING","SINK",
    "SIRE","SITE","SIZE","SKID","SKIM","SKIN","SKIP","SKIT","SLAB","SLAG","SLAM","SLAP","SLAT","SLAW",
    "SLAY","SLED","SLEW","SLID","SLIM","SLIP","SLIT","SLOB","SLOP","SLOT","SLOW","SLUG","SLUM","SLUR",
    "SMOG","SNAP","SNIP","SNOB","SNOW","SNUB","SNUG","SOAK","SOAP","SOAR","SOCK","SODA","SOFA","SOFT",
    "SOIL","SOLD","SOLE","SOME","SONG","SOON","SOOT","SORE","SORT","SOUL","SOUR","SPAN","SPAR","SPEC",
    "SPED","SPIN","SPIT","SPOT","SPUD","SPUR","STAB","STAG","STAR","STAY","STEM","STEP","STEW","STIR",
    "STOP","STUB","STUD","STUN","SUCH","SUIT","SULK","SURF","SWAN","SWAP","SWIM","TACK","TACT","TAIL",
    "TAKE","TALE","TALK","TALL","TAME","TANK","TAPE","TARN","TART","TASK","TEAM","TEAR","TELL","TEMP",
    "TEND","TENT","TERM","TEST","TEXT","THAN","THAT","THEM","THEN","THEY","THIN","THIS","THUD","THUS",
    "TICK","TIDE","TIDY","TIED","TIER","TILE","TILL","TILT","TIME","TINT","TINY","TIRE","TOAD","TOIL",
    "TOLD","TOLL","TOMB","TOME","TONE","TOOK","TOOL","TOPS","TORE","TORN","TOSS","TOUR","TOWN","TRAP",
    "TRAY","TREE","TREK","TRIM","TRIO","TRIP","TROD","TROT","TRUE","TUBE","TUCK","TUFT","TUNA","TUNE",
    "TURF","TURN","TUSK","TWIN","TYPE","UGLY","UNDO","UNIT","UNTO","UPON","URGE","USED","VAIN","VALE",
    "VANE","VARY","VASE","VAST","VEAL","VEER","VEIL","VEIN","VEND","VENT","VERB","VERY","VEST","VETO",
    "VIAL","VICE","VIEW","VINE","VISA","VOID","VOLT","VOTE","WADE","WAGE","WAIL","WAIT","WAKE","WALK",
    "WALL","WAND","WANT","WARD","WARM","WARN","WARP","WART","WARY","WASH","WASP","WAVE","WAVY","WAXY",
    "WEAK","WEAL","WEAR","WEED","WEEK","WEEP","WELD","WELL","WENT","WEPT","WERE","WEST","WHAT","WHEN",
    "WHIM","WHIP","WHOM","WICK","WIDE","WIFE","WILD","WILL","WILT","WILY","WIMP","WIND","WINE","WING",
    "WINK","WIPE","WIRE","WISE","WISH","WISP","WITH","WOKE","WOLF","WOMB","WOOD","WOOL","WORD","WORE",
    "WORK","WORM","WORN","WOVE","WRAP","WREN","YANK","YARD","YARN","YEAR","YELL","YOGA","YOKE","YOUR",
    "ZEAL","ZERO","ZEST","ZINC","ZONE","ZOOM",
    "BOARD","BRAIN","CRANE","DRAIN","FLAME","GRACE","GRAPE","LEARN","LEMON","LINER","LOGIC","MINER",
    "MONEY","OCEAN","OLIVE","PAINT","PEARL","PIANO","PLANT","PLATE","PLEAD","QUEEN","QUIET","RAVEN",
    "RIVER","SAINT","SCALE","SCENE","SCORE","SHADE","SHAPE","SHARE","SHINE","SIGHT","SINCE","SLATE",
    "SLEEP","SLIDE","SMILE","SMOKE","SNAKE","SOLAR","SOLVE","SOUND","SPACE","SPARE","SPEAK","SPEND",
    "SPICE","SPINE","SPOKE","SPORE","STAIN","STAIR","STAKE","STALE","STAND","STARE","START","STATE",
    "STAVE","STEAL","STEAM","STEEL","STEEP","STEER","STERN","STILL","STOCK","STOMP","STONE","STOOD",
    "STORE","STORM","STORY","STOVE","STRAW","STRAY","STRIP","STUCK","STUDY","STUMP","SUITE","SURGE",
    "SWAMP","SWEAR","SWEEP","SWEET","SWORE","TABLE","TASTE","THEIR","THERE","THICK","THING","THINK",
    "THORN","THREE","THROW","TIGER","TIRED","TOKEN","TOTAL","TOUCH","TOWER","TOXIC","TRACE","TRACK",
    "TRADE","TRAIL","TRAIN","TRAIT","TRASH","TREAT","TREND","TRICK","TRIED","TROOP","TRUCK","TRULY",
    "TRUMP","TRUNK","TRUST","TRUTH","TUNED","TWIST","ULTRA","UNDER","UNION","UNITY","UNTIL","UPPER",
    "URBAN","USAGE","USUAL","UTTER","VALID","VALUE","VAULT","VIDEO","VIGOR","VINYL","VIRUS","VISIT",
    "VITAL","VIVID","VOCAL","VOICE","VOTED","VOTER","WAGON","WASTE","WATCH","WATER","WHEAT","WHEEL",
    "WHERE","WHICH","WHILE","WHITE","WHOLE","WHOSE","WIDER","WOMAN","WORLD","WORRY","WORSE","WORST",
    "WORTH","WOULD","WOUND","WRITE","WRONG","WROTE","YACHT","YOUNG","YOUTH"
  ];

  /* ── Public API ───────────────────────────────────────── */

  function isValid(word) {
    word = word.toUpperCase();
    if (fullSet) return fullSet.has(word);
    return new Set(FALLBACK).has(word);
  }

  function fromRack(letters) {
    const counts = countLetters(letters);
    const source = aiWords.length ? aiWords : FALLBACK;
    return source.filter((word) => {
      const needed = countLetters(word.split(""));
      return Object.keys(needed).every((l) => needed[l] <= (counts[l] || 0));
    });
  }

  function isReady() { return ready; }

  /* ── Load full dictionary from file ───────────────────── */

  function load() {
    return fetch("data/words.txt")
      .then((res) => {
        if (!res.ok) throw new Error("Dictionary fetch failed");
        return res.text();
      })
      .then((text) => {
        const all = text.split(/\r?\n/).map((w) => w.trim().toUpperCase()).filter((w) => /^[A-Z]{2,}$/.test(w));
        fullSet = new Set(all);
        // AI uses words up to 7 letters for performance
        aiWords = all.filter((w) => w.length <= 7);
        ready = true;
        console.log(`Dictionary loaded: ${fullSet.size} words (AI subset: ${aiWords.length})`);
      })
      .catch((err) => {
        console.warn("Could not load dictionary file, using fallback:", err);
        fullSet = new Set(FALLBACK);
        aiWords = FALLBACK;
        ready = true;
      });
  }

  function countLetters(letters) {
    return letters.reduce((acc, l) => { acc[l] = (acc[l] || 0) + 1; return acc; }, {});
  }

  window.ScrabbleDictionary = { isValid, fromRack, isReady, load, words: FALLBACK };
})();
