---
newFileDate: 2023-07-20T21:57:00
timezone: 8
location: \#reddit-rplace
factions:
  - "[[factions/Kessoku Band|Kessoku Band]]"
parents:
tags:
---
```dataviewjs
const {createButton} = app.plugins.plugins["buttons"]
const {DateUtils} = customJS;

let h = dv.current().file.folder.toString();
let date = dv.current().newFileDate;
let dateString = [
	date.year,
	date.month.toString().padStart(2, "0"),
	date.day.toString().padStart(2, "0")
].join("-");
let timeString = [date.hour, date.minute].join("-");
let timezone = dv.current().timezone;
let titleString = DateUtils.shiftDateToTimeZone(dateString, timeString, timezone);
let index = 
	dv.pages(`"events"`).file.name
	.filter(name => name.includes(titleString))
	.sort(name => name, "ASC")
	.length + 1;
titleString = `${titleString} ${index}`;

let content = await dv.io.load(dv.current().file.path);
//console.log(content.replace(/.+# Contents\n/s, ""));

dv.paragraph(`There ${index == 1 ? "is" : "are"} ${index} event${index == 1 ? "" : "s"} occurring on ${dateString} at ${timeString.replace(/-/g, ":")} UTC${timezone > 0 ? "+" : ""}${timezone}.`)
dv.paragraph(`Button will create the file \`events/${titleString}.md\` with the following YAML attributes:`);
dv.paragraph(
`
\`\`\`
---
location: ${dv.current().location} 
factions:${
	dv.current().factions ? 
	dv.current().factions.map(f => `\n  - "${f}"`).join("") :
	""
}
parents:${
	dv.current().parents ? 
	dv.current().parents.map(f => `\n  - "${f}"`).join("") :
	""
}
tags:${
	dv.current().tags ? 
	["event"].concat(dv.current().tags).map(f => `\n- "#${f}"`).join("") :
	"\n- \"#event\""
}
---
\`\`\`
`);
//console.log(dv.current());

dv.paragraph(createButton({
	app, 
	el: this.container, 
	args: {
		name: "Create Event", 
		type: `note(zzztest note, split) template`, 
		action: "event",
	}
}));
```
# Contents
This is a test.