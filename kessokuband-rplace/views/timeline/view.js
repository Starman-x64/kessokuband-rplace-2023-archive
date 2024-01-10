let pages = dv.pages('"events"');
let timelineData = {};
const limit = input.limit < 0 ? pages.length : input.limit;

async function addPageToTimelineData(page) {
  let name = page.file.name;
  let date = name.slice(0, 10);
  let time = name.slice(11, 16);
  let index = parseInt(name.slice(17)) - 1;
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

function formatDateString(dateString) {
  return (new Date(dateString))
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
  return mdImage.replace(/!\[\[/gs, `<img src="${this.app.vault.adapter.basePath}\\`).replace(/\]\]/gs, "\" />");
}

function removeFrontMatter(content) {
  return content.replace(/---.+---\s/s, "")
}

(async () => {
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
					let mdImages = content.match(/!\[\[.+\]\]/gs);
					if (mdImages) {
						let htmlImages = mdImages.map(img => mdImageToHTMLImage(img));
						for (let i = 0; i < mdImages.length; i++) {
							content = content.replace(mdImages[i], htmlImages[i]);
						}
					}

					let eventDiv = dv.el("div", "");
          eventDiv.style.borderLeft = "solid 4px var(--link-color)";
          eventDiv.style.paddingLeft = "10px";
          
          locationDiv.append(eventDiv);

					let contentParagraph = dv.paragraph(content);
          let sourceSpan = dv.span(`[[${event.path}|(Source)]]`);
          contentParagraph.innerHTML = contentParagraph.innerHTML.replace("%20", " ");
          sourceSpan.style.fontSize = "50%"; 
          sourceSpan.style.lineHeight = "50%"; 
					eventDiv.appendChild(contentParagraph);
					eventDiv.appendChild(sourceSpan);
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
