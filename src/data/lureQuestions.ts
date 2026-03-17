export type OptionKey = 'A' | 'B' | 'C' | 'D';

export type Question = {
  id: number;
  title: string;
  options: {
    key: OptionKey;
    label: string;
  }[];
};

export const LURE_QUESTIONS: Question[] = [
{
id:1,
title:"What water clarity do you usually fish in?",
options:[
{key:'A',label:'Murky or stained'},
{key:'B',label:'Clear and calm'},
{key:'C',label:'Slightly stained'},
{key:'D',label:'Crystal clear surface activity'}
]
},
{
id:2,
title:"When do you prefer fishing?",
options:[
{key:'A',label:'Windy afternoons'},
{key:'B',label:'Midday slow bite'},
{key:'C',label:'Active feeding hours'},
{key:'D',label:'Sunrise or sunset'}
]
},
{
id:3,
title:"Your fishing style is:",
options:[
{key:'A',label:'Aggressive and active'},
{key:'B',label:'Patient and slow'},
{key:'C',label:'Strategic and searching'},
{key:'D',label:'Explosive and exciting'}
]
},
{
id:4,
title:"Where do you fish most often?",
options:[
{key:'A',label:'Around vegetation'},
{key:'B',label:'Near structure on the bottom'},
{key:'C',label:'Open water drop-offs'},
{key:'D',label:'Surface near cover'}
]
},
{
id:5,
title:"How do fish usually react?",
options:[
{key:'A',label:'Strike hard and fast'},
{key:'B',label:'Bite softly'},
{key:'C',label:'Chase moving bait'},
{key:'D',label:'Blow up on surface'}
]
},
{
id:6,
title:"What weather do you prefer?",
options:[
{key:'A',label:'Windy'},
{key:'B',label:'Stable calm weather'},
{key:'C',label:'Overcast'},
{key:'D',label:'Warm summer evenings'}
]
},
{
id:7,
title:"Depth preference?",
options:[
{key:'A',label:'Shallow to mid'},
{key:'B',label:'Bottom'},
{key:'C',label:'Mid to deep'},
{key:'D',label:'Surface'}
]
},
{
id:8,
title:"What excites you most?",
options:[
{key:'A',label:'Feeling vibration'},
{key:'B',label:'Subtle bites'},
{key:'C',label:'Tracking diving depth'},
{key:'D',label:'Watching surface strikes'}
]
},
{
id:9,
title:"Water temperature?",
options:[
{key:'A',label:'Moderate'},
{key:'B',label:'Cold'},
{key:'C',label:'Warm'},
{key:'D',label:'Hot summer'}
]
},
{
id:10,
title:"Fish mood today?",
options:[
{key:'A',label:'Aggressive'},
{key:'B',label:'Lazy'},
{key:'C',label:'Feeding actively'},
{key:'D',label:'Hunting near surface'}
]
},
{
id:11,
title:"You prefer:",
options:[
{key:'A',label:'Flash and vibration'},
{key:'B',label:'Natural presentation'},
{key:'C',label:'Wide wobble action'},
{key:'D',label:'Splash and sound'}
]
},
{
id:12,
title:"Wind conditions?",
options:[
{key:'A',label:'Strong wind'},
{key:'B',label:'No wind'},
{key:'C',label:'Light wind'},
{key:'D',label:'Calm glass water'}
]
},
{
id:13,
title:"Structure type?",
options:[
{key:'A',label:'Grass and weeds'},
{key:'B',label:'Rocks and logs'},
{key:'C',label:'Ledges and drop-offs'},
{key:'D',label:'Shoreline cover'}
]
},
{
id:14,
title:"Bite intensity?",
options:[
{key:'A',label:'Hard hits'},
{key:'B',label:'Light taps'},
{key:'C',label:'Reaction strikes'},
{key:'D',label:'Explosive blowups'}
]
},
{
id:15,
title:"Retrieval speed?",
options:[
{key:'A',label:'Medium steady'},
{key:'B',label:'Very slow'},
{key:'C',label:'Moderate with contact'},
{key:'D',label:'Short jerks and pauses'}
]
},
{
id:16,
title:"Water visibility?",
options:[
{key:'A',label:'Low'},
{key:'B',label:'High'},
{key:'C',label:'Medium'},
{key:'D',label:'Very clear'}
]
},
{
id:17,
title:"You like lures that:",
options:[
{key:'A',label:'Spin and flash'},
{key:'B',label:'Bend and wiggle'},
{key:'C',label:'Dive and wobble'},
{key:'D',label:'Pop and splash'}
]
},
{
id:18,
title:"Fishing goal?",
options:[
{key:'A',label:'Trigger reaction'},
{key:'B',label:'Convince hesitant fish'},
{key:'C',label:'Cover water fast'},
{key:'D',label:'Create excitement'}
]
},
{
id:19,
title:"Fishing season?",
options:[
{key:'A',label:'Spring wind'},
{key:'B',label:'Early cold season'},
{key:'C',label:'Mid season'},
{key:'D',label:'Summer'}
]
},
{
id:20,
title:"Strike type you enjoy?",
options:[
{key:'A',label:'Sudden impact'},
{key:'B',label:'Soft pressure'},
{key:'C',label:'Steady pull'},
{key:'D',label:'Surface explosion'}
]
},
{
id:21,
title:"Water movement?",
options:[
{key:'A',label:'Choppy'},
{key:'B',label:'Still'},
{key:'C',label:'Moderate'},
{key:'D',label:'Glass calm'}
]
},
{
id:22,
title:"Fish location?",
options:[
{key:'A',label:'Around grass'},
{key:'B',label:'On the bottom'},
{key:'C',label:'Suspended mid-water'},
{key:'D',label:'Near surface'}
]
},
{
id:23,
title:"Your patience level?",
options:[
{key:'A',label:'Medium'},
{key:'B',label:'High'},
{key:'C',label:'Balanced'},
{key:'D',label:'Low — want action'}
]
},
{
id:24,
title:"Fish activity level?",
options:[
{key:'A',label:'Active in wind'},
{key:'B',label:'Inactive'},
{key:'C',label:'Searching for bait'},
{key:'D',label:'Surface feeding'}
]
},
{
id:25,
title:"Lure visibility?",
options:[
{key:'A',label:'Flashy'},
{key:'B',label:'Natural'},
{key:'C',label:'Realistic baitfish'},
{key:'D',label:'Noticeable splash'}
]
},
{
id:26,
title:"You change spots often?",
options:[
{key:'A',label:'Sometimes'},
{key:'B',label:'Rarely'},
{key:'C',label:'Often'},
{key:'D',label:'Only for surface signs'}
]
},
{
id:27,
title:"What’s more important?",
options:[
{key:'A',label:'Vibration'},
{key:'B',label:'Realism'},
{key:'C',label:'Depth control'},
{key:'D',label:'Sound'}
]
},
{
id:28,
title:"Fishing challenge?",
options:[
{key:'A',label:'Dirty water'},
{key:'B',label:'Cold water'},
{key:'C',label:'Deep fish'},
{key:'D',label:'Surface action'}
]
},
{
id:29,
title:"What kind of strike do you expect?",
options:[
{key:'A',label:'Reaction'},
{key:'B',label:'Subtle bite'},
{key:'C',label:'Chase and hit'},
{key:'D',label:'Explosion'}
]
},
{
id:30,
title:"Your fishing personality:",
options:[
{key:'A',label:'Power angler'},
{key:'B',label:'Technical angler'},
{key:'C',label:'Analytical angler'},
{key:'D',label:'Action seeker'}
]
}
];