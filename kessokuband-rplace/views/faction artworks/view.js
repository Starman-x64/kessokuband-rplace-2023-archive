let pages = dv.pages('"artwork"').where(page => { return page["parent-factions"].map(p => p.path).join(" ").includes(input.thisFilePath); });
const limit = input.limit < 0 ? pages.length : input.limit;

function mdImageToHTMLImage(mdImage) {
  let style = mdImage.match(/\|\d+/gs);
  let styleString = "";
  // if (style) {
  //   styleString = `style="width:${style[0].slice(1)}px;"`;
  // }
  return mdImage.replace(/!\[\[/gs, `<img src="${this.app.vault.adapter.basePath}/`).replace(/\]\]/gs, `"${styleString} />`).replace(/\|\d+/gs, "");
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
  let data = {};
  
  for (let i = 0; i < limit; i++) {
    let page = pages[i];
		let content = await dv.io.load(pages[i].file.path);
    page.content = replaceMdImages(content);
    data[page.name] = page;
	}
  
  pages.forEach((page) => {
    let artworkDiv = dv.el("div", "");
    let leftDiv = dv.el("div", "");
    let rightDiv = dv.el("div", "");
    let image = page.content.match(/final version:.+$/m)[0].replace(/(final version: ")|("$)/gm, "");
    let imageDiv = dv.el("div", image);
    //let imgDiv = dv.el("div", "");
    
    let titleDiv = dv.el("div", "");
    let aliasesDiv = dv.el("div", "");
    aliasesDiv.appendChild(dv.el("div", page.aliases ? page.aliases.map(a => `${a}`).join(", ") : ""));
    let parentFactionsDiv = dv.el("div", "");
    parentFactionsDiv.appendChild(dv.span("**Factions:**"));
    parentFactionsDiv.appendChild(dv.el("div", page["parent-factions"] ? page["parent-factions"].map(a => `- **${a}**`).join("\n") : "- None Listed"));
    let finalCoordsDiv = dv.el("div", "");
    let authorsDiv = dv.el("div", "");
    authorsDiv.appendChild(dv.span("**Authors:**"));
    authorsDiv.appendChild(dv.el("div", page.authors ? page.authors.map(a => `- *${a}*`).join("\n") : "- None Listed"));
    finalCoordsDiv.appendChild(dv.span("**Final Coordinates:** "));
    finalCoordsDiv.appendChild(dv.el("span", page["final-coordinates"] ? `${page["final-coordinates"]}` : "- Not Listed"));

    titleDiv.appendChild(dv.header(3, `[[${page.file.link.path}|${page.name}]]`));
    titleDiv.appendChild(aliasesDiv);
    leftDiv.appendChild(titleDiv);
    leftDiv.appendChild(parentFactionsDiv);
    leftDiv.appendChild(authorsDiv);
    leftDiv.appendChild(finalCoordsDiv);
    rightDiv.appendChild(imageDiv);
    artworkDiv.appendChild(leftDiv);
    artworkDiv.appendChild(rightDiv);
    
    titleDiv.classList.add("artwork-title");
    aliasesDiv.classList.add("artwork-aliases");
    leftDiv.classList.add("leftDiv");
    rightDiv.classList.add("rightDiv");
    imageDiv.classList.add("artwork-img");
    artworkDiv.classList.add("artwork-div");
  });

})();
