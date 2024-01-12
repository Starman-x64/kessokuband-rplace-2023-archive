# Create Event
### Fill in event content [[home/create event contents|here]], then press `Create Event` to make event with the correct file name.

```dataviewjs
const {update} = this.app.plugins.plugins["metaedit"].api
const {getPropertyValue} = this.app.plugins.plugins["metaedit"].api
const {createButton} = app.plugins.plugins["buttons"];
const createEventContentsPath = "home/create event contents.md";

function incrementTime(delta) {
	const createEventContents = dv.page(createEventContentsPath);
	let currentDate = new Date(createEventContents.newFileDate.toString());
	console.log(dv.current().file.path);
	let newDate = currentDate;
	newDate.setTime(currentDate.getTime() + delta.hours * 3600_000 + delta.minutes * 60_000);
	update("newFileDate", newDate.toISOString(), createEventContents.file.path);	
}

let buttons = [
createButton(
	{
		app,
		el: this.container,
		args: {name: "+60"},
		clickOverride: {
			click: incrementTime,
			params: [{ hours: 1, minutes: 0 }]
		}
	}
),
createButton(
	{
		app,
		el: this.container,
		args: {name: "+30"},
		clickOverride: {
			click: incrementTime,
			params: [{ hours: 0, minutes: 30 }]
		}
	}
),
createButton(
	{
		app,
		el: this.container,
		args: {name: "+1"},
		clickOverride: {
			click: incrementTime,
			params: [{ hours: 0, minutes: 1 }]
		}
	}
),
dv.span(" Change Time (mins) "),
createButton(
	{
		app,
		el: this.container,
		args: {name: "-1"},
		clickOverride: {
			click: incrementTime,
			params: [{ hours: 0, minutes: -1 }]
		}
	}
),
createButton(
	{
		app,
		el: this.container,
		args: {name: "-30"},
		clickOverride: {
			click: incrementTime,
			params: [{ hours: 0, minutes: -30 }]
		}
	}
),
createButton(
	{
		app,
		el: this.container,
		args: {name: "-60"},
		clickOverride: {
			click: incrementTime,
			params: [{ hours: -1, minutes: 0 }]
		}
	}
),
]
buttons.forEach((button) => {
	if (!button.type) return;
	button.style.paddingLeft = "1em";
	button.style.paddingRight = "1em";
});
```

```dataviewjs
await dv.view("views/create event", { thisdv: this });
```
