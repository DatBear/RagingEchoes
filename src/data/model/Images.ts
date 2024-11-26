import { skills } from "./Skill";

const images: Record<string, string> = {
  "law": "https://oldschool.runescape.wiki/images/thumb/Law_rune_detail.png/240px-Law_rune_detail.png",
  "blood": "https://oldschool.runescape.wiki/images/thumb/Blood_rune_detail.png/240px-Blood_rune_detail.png",
  "soul": "https://oldschool.runescape.wiki/images/thumb/Soul_rune_detail.png/240px-Soul_rune_detail.png",
  "wrath": "https://oldschool.runescape.wiki/images/thumb/Wrath_rune_detail.png/240px-Wrath_rune_detail.png",
  "astral": "https://oldschool.runescape.wiki/images/thumb/Astral_rune_detail.png/240px-Astral_rune_detail.png",
  "lunar": "https://oldschool.runescape.wiki/images/Lunar_spellbook.png",
  "ancients": "https://oldschool.runescape.wiki/images/Ancient_spellbook.png",
  "arceuus": "https://oldschool.runescape.wiki/images/Arceuus_spellbook.png",
  "normal spellbook": "https://oldschool.runescape.wiki/images/Standard_spellbook.png",
  "piety": "https://oldschool.runescape.wiki/images/Piety.png",
  "chivalry": "https://oldschool.runescape.wiki/images/Chivalry.png",
  "augury": "https://oldschool.runescape.wiki/images/Augury.png",
  "rigour": "https://oldschool.runescape.wiki/images/Rigour.png",
  "armour": "https://oldschool.runescape.wiki/images/Defence_icon_%28detail%29.png",
  "weapon": "https://oldschool.runescape.wiki/images/Attack_icon_%28detail%29.png",
  "melee": "https://oldschool.runescape.wiki/images/Melee.png",
  "ranged": "https://oldschool.runescape.wiki/images/Ranged_icon_%28detail%29.png",
  "magic": "https://oldschool.runescape.wiki/images/Magic_icon_%28detail%29.png",
  "rune pouch": "https://oldschool.runescape.wiki/images/thumb/Rune_pouch_detail.png/260px-Rune_pouch_detail.png",
  "spellbooks": "https://oldschool.runescape.wiki/images/Standard_spellbook.png",

};

skills.forEach(x => {
  images[x.toLowerCase()] = `https://oldschool.runescape.wiki/images/${x}_icon_%28detail%29.png`
});

images.regions = "https://oldschool.runescape.wiki/images/Misthalin_Area_Badge.png";
images.masteries = "https://oldschool.runescape.wiki/images/Melee_I.png";
images.relics = "https://oldschool.runescape.wiki/images/thumb/Power_Miner_detail.png/100px-Power_Miner_detail.png";
images.prayers = images.prayer!;
images.skills = images.attack!;
images.runes = images.law!;
images.bosses = images.slayer!;
images.teleports = images.magic!;
images.gear = "https://oldschool.runescape.wiki/images/Attack_style_icon.png";

images["range"] = "https://oldschool.runescape.wiki/images/Ranged_icon_%28detail%29.png";
images["runecrafting"] = "https://oldschool.runescape.wiki/images/Runecraft_icon_%28detail%29.png";

images.wiki = "https://oldschool.runescape.wiki/images/Wiki.png";
images.minigames = "https://oldschool.runescape.wiki/images/thumb/Soul_cape_%28red%29_detail.png/200px-Soul_cape_%28red%29_detail.png";

export default images;