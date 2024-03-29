let pages = dv.pages('"events"');
let timelineData = {};
const limit = input.limit < 0 ? pages.length : input.limit;
const utcOffset = input.utcOffset ? input.utcOffset : 0;

function shiftDateToTimeZone(dateString, timeString, utcOffset = 0) {
  let utcDateString = dateString + "T" + timeString.replace("-", ":") + ":00Z";
  let utcDate = new Date(utcDateString);
  let offsetDate = new Date();
  offsetDate.setTime(utcDate.getTime() + utcOffset * 3600000);
  let offsetDateString = offsetDate.toISOString();
  offsetDateString = offsetDateString.replace(/T/g, " ").replace(/(:00.000Z)/g, "").replace(/:/g, "-");
  return offsetDateString;
}

async function addPageToTimelineData(page) {
  let name = page.file.name;
  let index = parseInt(name.slice(17)) - 1;
  let shidftedDate = shiftDateToTimeZone(name.slice(0, 10), name.slice(11, 16), utcOffset);
  let date = shidftedDate.slice(0, 10);
  let time = shidftedDate.slice(11, 16);
  if (!timelineData[date]) {
    timelineData[date] = {};
  }
  if (!timelineData[date][time]) {
    timelineData[date][time] = {};
  }
  if (!timelineData[date][time][page.location]) {
    timelineData[date][time][page.location] = [];
  }
  let content = await dv.io.load(page.file.path);
  timelineData[date][time][page.location][index] = {
    path: page.file.path,
    content: content
  };
}

function formatDateString(date) {
  return (typeof(date) == "string" ? new Date(date) : date)
    .toLocaleDateString(
      'en-GB',
      { day: 'numeric', month: 'short', year: 'numeric' }
    );
}

function formatLocation(location) {
  // if (location.slice(0, 2) != "r/") {
  //   return "\\#" + location;
  // }
  return location;
}

function mdImageToHTMLImage(mdImage) {
  let style = mdImage.match(/\|\d+/gs);
  let styleString = "";
  if (style) {
    styleString = `style="width:${style[0].slice(1)}px;"`;
  }
  return mdImage.replace(/!\[\[/gs, `<img src="${this.app.vault.adapter.basePath}\\`).replace(/\]\]/gs, `" ${styleString} />`).replace(/\|\d+/gs, "");
}

function replaceMdImages(content) {
  let mdImages = content.match(/!\[\[.+\]\]/gs);
  if (mdImages) {
    let htmlImages = mdImages.map(img => mdImageToHTMLImage(img));
    for (let i = 0; i < mdImages.length; i++) {
      content = content.replace(mdImages[i], htmlImages[i]);
    }
  }
  return content;
}

function removeFrontMatter(content) {
  return content.replace(/---.+---\s/s, "")
}

(async () => {
  pages = pages.sort(page => page.file.name, "ASC");
  
  if (utcOffset != 0) {
    dv.header(2, `UTC${utcOffset > 0 ? "+" : ""}${utcOffset}`);
  }
	for (let i = 0; i < limit; i++) {
		await addPageToTimelineData(pages[i]);
	}
  
	Object.entries(timelineData).forEach(([date, times]) => {
		let formattedDate = formatDateString(date);
    let dateDiv = dv.el("div", "");

    dateDiv.style.borderLeft = "solid 4px color-mix(in srgb, var(--link-color) 25%, black)";
    dateDiv.style.paddingLeft = "10px";

		dateDiv.append(dv.header(2, formattedDate));

		Object.entries(times).forEach(([time, locations]) => {
			let formattedTime = time.replace("-", ":");
      let timeDiv = dv.el("div", "");

      timeDiv.style.borderLeft = "solid 4px color-mix(in srgb, var(--link-color) 50%, black)";
      timeDiv.style.paddingLeft = "10px";
      
      timeDiv.append(dv.header(3, formattedTime));
      dateDiv.append(timeDiv);
      
			Object.entries(locations).forEach(([location, events]) => {
        let locationDiv = dv.el("div", "");
  
        locationDiv.style.borderLeft = "solid 4px color-mix(in srgb, var(--link-color) 75%, black)";
        locationDiv.style.paddingLeft = "10px";
        
        locationDiv.append(dv.header(4, formatLocation(location)));
        timeDiv.append(locationDiv);

				Object.entries(events).forEach(([index, event]) => {
					let content = removeFrontMatter(event.content);
					content = replaceMdImages(content);

					let eventDiv = dv.el("div", "");
          eventDiv.style.borderLeft = "solid 4px var(--link-color)";
          eventDiv.style.paddingLeft = "10px";
          
          locationDiv.append(eventDiv);

					let contentParagraph = dv.paragraph(`${content}<span style="font-size:75%; line-height:75%;">[[${event.path}|(Source)]]</span>`);
          // let sourceSpan = dv.span(`[[${event.path}|(Source)]]`);
          // contentParagraph.innerHTML = contentParagraph.innerHTML.replace("%20", " ");
          // sourceSpan.style.fontSize = "50%"; 
          // sourceSpan.style.lineHeight = "50%"; 
					eventDiv.appendChild(contentParagraph);
					// eventDiv.appendChild(sourceSpan);
					//div.style.padding = "0.025px 10px 0.025px 10px";
					//paragraph.style.padding = "0";
					//markdown-embed-title
					//paragraph.classList.add("naked-embed");
					//paragraph.setAttribute("data-location", "#" + event[1]);
					//if (index == 0) paragraph.setAttribute("data-time", formattedTime); 
					//let span = document.createElement("span");
					//span.innerHTML = "test";
				});
			});
		});
	});
})();
