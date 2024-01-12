const {createButton} = this.app.plugins.plugins["buttons"];
const {DateUtils} = customJS;
const {LintingUtils} = customJS;

const thisdv = input.thisdv;

var usePlural = (qty, singular, plural) => qty == 1 ? singular : plural;

let eventContentsPath = `${dv.current().file.folder}/create event contents.md`;
let eventContentsFile = dv.page(eventContentsPath);

let date = eventContentsFile.newFileDate;
let dateString = [
	date.year,
	date.month.toString().padStart(2, "0"),
	date.day.toString().padStart(2, "0")
].join("-");
let timeString = [date.hour, date.minute].join("-");
let timezone = eventContentsFile.timezone;
let newFileName = DateUtils.shiftDateToTimeZone(dateString, timeString, timezone);
let index = 
	dv.pages(`"events"`).file.name
	.filter(name => name.includes(newFileName))
	.sort(name => name, "ASC")
	.length + 1;
newFileName = `events/${newFileName} ${index}`;

let content = (await dv.io.load(eventContentsPath));
content = lintContent(content);




let location = eventContentsFile.location ? eventContentsFile.location : "\\#reddit-rplace"
let factions = eventContentsFile.factions ? eventContentsFile.factions : [dv.fileLink("factions/Kessoku Band")];
let parents = eventContentsFile.parents ? eventContentsFile.parents : [];
let tags = eventContentsFile.tags ? [...new Set(["#event"].concat(eventContentsFile.tags))] : ["#event"];
let yaml = 
`---
location: ${location} 
factions:${factions.map(
	f => 
	`\n  - "${f.markdown().replace(/\.md\|/g, "|")}"`)
	.join("")
}
parents:${parents.map(
	f => 
	`\n  - "${f.markdown().replace(/\.md\|/g, "|")}"`)
	.join("")
}
tags:${tags.map(f => `\n  - "${f}"`).join("")}
---`;

dv.paragraph(`There ${usePlural(index-1, "is", "are")} ${index - 1} ${usePlural(index-1, "event", "events")} occurring on ${dateString} at ${timeString.replace(/-/g, ":")} UTC${timezone > 0 ? "+" : ""}${timezone}.`)
dv.paragraph(`Pressing the button will create the file \`${newFileName}.md\` with the following content:`);

let newFileContents = `${yaml}\n${content}`;
dv.paragraph("`````\n" + newFileContents + "\n`````");
dv.paragraph(createButton({
	app, 
	el: thisdv.container, 
	args: {
		name: "Create Event",
		type: `note(${newFileName}, split) text`,
		action: newFileContents,
	}
}));

function getFirstAliasFromFilePath(path) {
  let page = dv.page(path);
  // console.log(page);
  return page.aliases ? page.aliases[0] : page.file.name;
}

function lintContent(content) {
  // lint content
  content = LintingUtils.removeYAML(content);

  // ensure one new line at the end
  /*
  /([^\n])(\n)(\n+|)$/gs
  Group 1:
    Match last character non-line break ([^\n])
  Group 2:
    Match the first of the following line breaks (\n).
  Group 3:
    If there are more line breaks before the end, match those (\n+).
    OR (|)
    If the last line break was matched by Group 1, match nothing and succeed.
  All groups must match before the end of the string ($).

  The regex should always find a match, as we append an additional new line to ensure there is at least one (it will fail otherwise).
  */
  content = `${content}\n`.replace(/([^\n])(\n)(\n+|)$/gs, "$1.$2");

  // try to ensure the last sentence ends in one of . ? ! ) " ' `
  /*
  /(^.+)([.!?)"'`])(\.?)(\n)$/gs
  Group 1:
    Match the last/second last valid character ([.!?)"'`]).
  Group 2:
    Match the full stop we inserted if Group 1 found something else (\.?).
  Group 3:
    Match the new line at the end (\n).
  All groups must match before the end of the string ($).

  The regex should always find a match, as we added a full stop after the last linting step to ensure there is at least one of . ? ! ) " ' `
  */
  content = content.replace(/([.!?)"'`])(\.?)(\n)$/gs, "$1$3");

  /*
    USER LINKS
    =======================================================
    Matches user links missing an alias:
    Group 1: opening brackets and path
    Group 2: location to insert pipe symbol and alias.
    Group 3: closing brackets.
    /(\[\[users\/[\w\s]+[^|])()(\]\])/gm
    
    vvv $1|alias$3 (Insert Alias at Group 2) vvv
    
    Matches full user links with one ore more asterisks on either side of the link.
    Group 1: asterisks (or lack of) on left
    Group 2: user link
    Group 3: asterisks (or lack of) on right
    /(\*+|)(\[\[users\/[\w\s]+[|][^\[\]]+\]\])(\*+|)/gm
    
    vvv *$2* (Insert One Asterisks at Groups 1 and 3) vvv
    
    Should be complete.
  */
  content = content.replace(/(\[\[users\/[\w\s]+[^|])()(\]\])/gm, "$1|alias$3");
  let userLinks = content.match(/(\[\[users\/[\w\s]+)(\|alias)(\]\])/gm);
  if (userLinks) {
    let newUserLinks = userLinks.map((link) => {
      let path = link.match(/users\/[\w\s]+[^|]/g)[0];
      let newLink = link.replace(/\|alias/, `|${getFirstAliasFromFilePath(path)}`);
      return newLink;
    });
    userLinks.forEach((userLink, index) => {
      content = content.replace(userLink, newUserLinks[index]);
    });
    content = content.replace(/(\*+|)(\[\[users\/[\w\s]+[|][^\[\]]+\]\])(\*+|)/gm, "*$2*");
  }
  
  /*    FACTION/SUBFACTION LINKS
    =======================================================
    Matches faction/subfaction links missing an alias:
    Group 1: opening brackets and path
    Group 2: location to insert pipe symbol and alias.
    Group 3: closing brackets.
    /(\[\[factions\/[\w\s\/]+[^|])()(\]\])/gm
    
    vvv $1|alias$3 (Insert Alias at Group 2) vvv

    Matches full faction/subfaction links with any number of asterisks on either side
    Group 1: asterisks (or lack of) on left
    Group 2: faction link
    Group 3: asterisks (or lack of) on right
    /(\*+|)(\[\[factions\/[\w\s\/]+[|][^\[\]]+\]\])(\*+|)/gm

    vvv **$2** (Insert Two Asterisks at Groups 1 and 3) vvv

    Should be complete.
  */
    
    content = content.replace(/(\[\[factions\/[\w\s\/]+[^|])()(\]\])/gm, "$1|alias$3");
    let factionLinks = content.match(/(\[\[factions\/[\w\s\/]+)(\|alias)(\]\])/gm);
    if (factionLinks) {
      //console.log(content);
      let newFactionLinks = factionLinks.map((link) => {
        let path = link.match(/factions\/[\w\s\/]*[^|]/g)[0];
        let newLink = link.replace(/\|alias/, `|${getFirstAliasFromFilePath(path)}`);
        return newLink;
      });
      factionLinks.forEach((factionLink, index) => {
        content = content.replace(factionLink, newFactionLinks[index]);
      });
      content = content.replace(/(\*+|)(\[\[factions\/[\w\s\/]+[|][^\[\]]+\]\])(\*+|)/gm, "**$2**");
    }
  /*  
    ARTWORK LINKS
    =======================================================
    Matches faction/subfaction links missing an alias:
    Group 1: opening brackets and path
    Group 2: location to insert pipe symbol and alias.
    Group 3: closing brackets.
    /(\[\[artwork\/[\w\s]+[^|])()(\]\])/gm
    
    vvv $1|alias$3 (Insert Alias at Group 2) vvv

    Matches full faction/subfaction links with any number of asterisks on either side
    Group 1: asterisks (or lack of) on left
    Group 2: faction link
    Group 3: asterisks (or lack of) on right
    /(\*+|)(\[\[artwork\/[\w\s]+[|][^\[\]]+\]\])(\*+|)/gm

    vvv ***$2*** (Insert Three Asterisks at Groups 1 and 3) vvv

    Should be complete.

  */
  
  console.log(`content: ${content}`);
  content = content.replace(/(\[\[artwork\/[\w\s]+[^|])()(\]\])/gm, "$1|alias$3");
  let artworkLinks = content.match(/(\[\[factions\/[\w\s\/]+)(\|alias)(\]\])/gm);
  if (artworkLinks) {
    //console.log(content);
    let newArtworkLinks = artworkLinks.map((link) => {
      let path = link.match(/artwork\/[\w\s]*[^|]/g)[0];
      let newLink = link.replace(/\|alias/, `|${getFirstAliasFromFilePath(path)}`);
      return newLink;
    });
    artworkLinks.forEach((artworkLink, index) => {
      content = content.replace(artworkLink, newArtworkLinks[index]);
    });
    content = content.replace(/(\*+|)(\[\[artwork\/[\w\s]+[|][^\[\]]+\]\])(\*+|)/gm, "**$2**");
  }


  return content;
}