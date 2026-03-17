export type BaitId =
  | 'spinnerbait'
  | 'soft_plastic_worm'
  | 'crankbait'
  | 'topwater_popper'
  | 'jerkbait'
  | 'jig'
  | 'swimbait'
  | 'spoon'
  | 'buzzbait'
  | 'blade_bait'
  | 'frog_lure'
  | 'lipless_crankbait'
  | 'tube_bait'
  | 'inline_spinner'
  | 'chatterbait'
  | 'carolina_rig'
  | 'drop_shot_rig'
  | 'glide_bait'
  | 'crawfish_imitation'
  | 'umbrella_rig';

export type BaitItem = {
  id: BaitId;
  title: string;
  bestFor: string;
  waterType?: string;
  depth: string;
  description: string;
  whyItWorks: string;
  proTip: string;
  imageKey: BaitId;
};

export const BAITS: BaitItem[] = [
  {
    id: 'spinnerbait',
    title: 'Spinnerbait',
    bestFor: 'Bass, Pike',
    waterType: 'Murky, stained, windy conditions',
    depth: 'Shallow to mid-depth',
    description:
      'A spinnerbait consists of a bent wire frame with one or more rotating blades attached to the upper arm and a weighted hook with a skirt on the lower arm. The spinning blades create flash and vibration while the skirt pulses naturally in the water. This combination imitates distressed baitfish and stimulates predatory instincts.',
    whyItWorks:
      'The vibration allows fish to detect the lure through their lateral line even when visibility is poor. The flash mimics fleeing prey.',
    proTip:
      'Ideal for covering water quickly. Vary retrieve speed and occasionally let it drop to trigger reaction strikes.',
    imageKey: 'spinnerbait',
  },
  {
    id: 'soft_plastic_worm',
    title: 'Soft Plastic Worm',
    bestFor: 'Bass',
    waterType: 'Clear to slightly stained',
    depth: 'Bottom',
    description:
      'Soft plastic worms are among the most versatile lures in fishing. They can be rigged Texas style, Carolina style, wacky rig, or weightless. Their soft body creates subtle lifelike movements even with minimal action from the angler.',
    whyItWorks:
      'In pressured waters where fish are cautious, the natural presentation makes this lure highly convincing.',
    proTip:
      'Slow presentations near structure such as rocks, wood, or submerged vegetation are highly effective.',
    imageKey: 'soft_plastic_worm',
  },
  {
    id: 'crankbait',
    title: 'Crankbait',
    bestFor: 'Bass, Walleye',
    waterType: 'Clear to moderately stained',
    depth: 'Mid to deep',
    description:
      'Crankbaits are hard-bodied lures equipped with a plastic or metal lip that determines diving depth. As retrieved, the lure produces a tight or wide wobbling action depending on design.',
    whyItWorks:
      'The consistent wobble triggers reaction strikes from fish that may not be actively feeding.',
    proTip:
      'Choose diving depth carefully. Allow the lure to make contact with structure for more aggressive bites.',
    imageKey: 'crankbait',
  },
  {
    id: 'topwater_popper',
    title: 'Topwater Popper',
    bestFor: 'Bass',
    waterType: 'Calm or lightly rippled',
    depth: 'Surface',
    description:
      'Topwater poppers float and produce splashing noises when jerked. The cupped mouth displaces water, creating a popping sound that imitates injured surface prey.',
    whyItWorks:
      'Surface commotion draws fish from below and often triggers explosive strikes during low-light conditions.',
    proTip:
      'Pause between pops. Many strikes occur during the pause.',
    imageKey: 'topwater_popper',
  },
  {
    id: 'jerkbait',
    title: 'Jerkbait',
    bestFor: 'Bass, Trout',
    depth: 'Mid-water',
    description:
      'Jerkbaits are slender, minnow-shaped lures designed for sharp side-to-side movement. Some models suspend in place during pauses, increasing strike opportunities.',
    whyItWorks:
      'The erratic movement mimics injured baitfish, triggering predatory instinct.',
    proTip:
      'Use a twitch–twitch–pause retrieve pattern, especially in cooler water.',
    imageKey: 'jerkbait',
  },
  {
    id: 'jig',
    title: 'Jig',
    bestFor: 'Bass',
    depth: 'Bottom',
    description:
      'A jig features a weighted head and a skirted body, often paired with a soft plastic trailer. It is highly effective in heavy cover and around structure.',
    whyItWorks:
      'The compact profile and bottom-oriented presentation imitate crawfish or bottom prey.',
    proTip:
      'Let it fall naturally and maintain bottom contact.',
    imageKey: 'jig',
  },
  {
    id: 'swimbait',
    title: 'Swimbait',
    bestFor: 'Bass, Pike',
    depth: 'Variable',
    description:
      'Swimbaits replicate the swimming motion of real baitfish. They can be soft-bodied or hard-bodied, jointed or single-piece.',
    whyItWorks:
      'Realistic swimming action and profile make it ideal for targeting larger predators.',
    proTip:
      'Match color and size to local forage species.',
    imageKey: 'swimbait',
  },
  {
    id: 'spoon',
    title: 'Spoon',
    bestFor: 'Trout, Pike',
    depth: 'Variable',
    description:
      'A spoon is a curved metal lure that flashes as it wobbles through water. It can be cast, trolled, or jigged vertically.',
    whyItWorks:
      'Strong flash attracts fish from long distances.',
    proTip:
      'Use in open water and around suspended fish.',
    imageKey: 'spoon',
  },
  {
    id: 'buzzbait',
    title: 'Buzzbait',
    bestFor: 'Bass',
    depth: 'Surface',
    description:
      'Buzzbaits feature a spinning propeller that churns water on the surface during retrieve.',
    whyItWorks:
      'Noise and vibration provoke aggressive surface strikes.',
    proTip:
      'Keep retrieve constant to maintain surface disturbance.',
    imageKey: 'buzzbait',
  },
  {
    id: 'blade_bait',
    title: 'Blade Bait',
    bestFor: 'Walleye, Bass',
    depth: 'Deep',
    description:
      'Blade baits are thin metal lures that vibrate intensely during lift-and-drop motion.',
    whyItWorks:
      'Highly effective in cold water when fish are deeper and less active.',
    proTip:
      'Use short vertical lifts followed by controlled drops.',
    imageKey: 'blade_bait',
  },
  {
    id: 'frog_lure',
    title: 'Frog Lure',
    bestFor: 'Bass',
    waterType: 'Heavy vegetation, lily pads',
    depth: 'Surface',
    description:
      'A frog lure is a hollow-bodied, weedless topwater bait designed to glide across thick vegetation without snagging. Its soft body compresses easily when a fish strikes, allowing the hooks to set effectively.',
    whyItWorks:
      'It imitates real frogs and small amphibians that naturally move across the surface. Bass hiding under vegetation attack aggressively from below.',
    proTip:
      'Wait a split second after the strike before setting the hook to ensure the fish fully takes the lure.',
    imageKey: 'frog_lure',
  },
  {
    id: 'lipless_crankbait',
    title: 'Lipless Crankbait',
    bestFor: 'Bass',
    waterType: 'Clear to stained',
    depth: 'Mid-water',
    description:
      'Unlike traditional crankbaits, lipless crankbaits sink and vibrate intensely during retrieve. Many models include internal rattles for added attraction.',
    whyItWorks:
      'They cover large areas quickly and create strong vibration, making them ideal for locating active fish.',
    proTip:
      'Use a yo-yo retrieve, lifting the rod tip and letting the lure fall back down.',
    imageKey: 'lipless_crankbait',
  },
  {
    id: 'tube_bait',
    title: 'Tube Bait',
    bestFor: 'Bass',
    waterType: 'Clear',
    depth: 'Bottom',
    description:
      'Tube baits are hollow soft plastics shaped like small squid or baitfish. When rigged with an internal jig head, they fall in a spiraling motion that looks extremely natural.',
    whyItWorks:
      'Their unpredictable fall mimics dying baitfish or small crawfish.',
    proTip:
      'Fish them around rocky structure and drop-offs.',
    imageKey: 'tube_bait',
  },
  {
    id: 'inline_spinner',
    title: 'Inline Spinner',
    bestFor: 'Trout, Perch',
    waterType: 'Rivers and streams',
    depth: 'Shallow to mid',
    description:
      'An inline spinner features a rotating blade mounted directly on a central shaft above the hook. The blade spins immediately upon retrieve.',
    whyItWorks:
      'Flash and vibration attract fish in moving water where visibility may vary.',
    proTip:
      'Cast slightly upstream and retrieve steadily with the current.',
    imageKey: 'inline_spinner',
  },
  {
    id: 'chatterbait',
    title: 'Chatterbait (Bladed Jig)',
    bestFor: 'Bass',
    waterType: 'Stained water',
    depth: 'Shallow',
    description:
      'A chatterbait combines a jig with a vibrating metal blade attached to the front. The blade creates intense vibration and erratic movement.',
    whyItWorks:
      'It produces both flash and vibration, making it effective in murky water.',
    proTip:
      'Fish it through grass lines and shallow cover.',
    imageKey: 'chatterbait',
  },
  {
    id: 'carolina_rig',
    title: 'Carolina Rig',
    bestFor: 'Bass',
    waterType: 'Open flats, structure',
    depth: 'Bottom',
    description:
      'The Carolina rig uses a sliding weight above a leader and hook. It keeps the bait slightly above the bottom while maintaining contact with structure.',
    whyItWorks:
      'It allows anglers to cover large areas slowly while maintaining natural bait movement.',
    proTip:
      'Drag slowly and feel for subtle bites.',
    imageKey: 'carolina_rig',
  },
  {
    id: 'drop_shot_rig',
    title: 'Drop Shot Rig',
    bestFor: 'Bass',
    waterType: 'Clear deep water',
    depth: 'Deep',
    description:
      'The drop shot rig positions the weight below the bait, keeping it suspended above the bottom. It is ideal for vertical fishing.',
    whyItWorks:
      'It keeps the lure in the strike zone longer and offers precise depth control.',
    proTip:
      'Use minimal rod movement; subtle shakes are enough.',
    imageKey: 'drop_shot_rig',
  },
  {
    id: 'glide_bait',
    title: 'Glide Bait',
    bestFor: 'Trophy Bass',
    waterType: 'Clear',
    depth: 'Mid-water',
    description:
      'Glide baits are large jointed swimbaits that move in wide, sweeping motions. They are designed to target larger predatory fish.',
    whyItWorks:
      'Their size and smooth movement imitate injured baitfish, appealing to big fish.',
    proTip:
      'Retrieve slowly with long, steady rod sweeps.',
    imageKey: 'glide_bait',
  },
  {
    id: 'crawfish_imitation',
    title: 'Crawfish Imitation',
    bestFor: 'Bass',
    waterType: 'Rocky bottoms',
    depth: 'Bottom',
    description:
      'Soft plastic crawfish imitations replicate one of bass’s primary food sources. They feature claws that move naturally in the water.',
    whyItWorks:
      'Bass frequently feed on crawfish near rocks and structure.',
    proTip:
      'Use in spring when crawfish are most active.',
    imageKey: 'crawfish_imitation',
  },
  {
    id: 'umbrella_rig',
    title: 'Umbrella Rig',
    bestFor: 'Schooling Bass',
    waterType: 'Open water',
    depth: 'Mid',
    description:
      'The umbrella rig (also known as Alabama rig) features multiple arms with attached swimbaits, imitating a small school of baitfish.',
    whyItWorks:
      'Predatory fish are triggered by the appearance of multiple prey targets.',
    proTip:
      'Use steady retrieve in areas where fish are actively schooling.',
    imageKey: 'umbrella_rig',
  },
];