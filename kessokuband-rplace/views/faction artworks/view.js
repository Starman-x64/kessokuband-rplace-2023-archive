let pages = dv.pages('"artwork"').where(page => { return page.parentFactions.map(p => p.path).join(" ").includes(input.thisFilePath); });
const limit = input.limit < 0 ? pages.length : input.limit;
const thisdv =input.thisdv;

function mdImageToHTMLImage(mdImage, alt) {
  let style = mdImage.match(/\|\d+/gs);
  let altString = alt ? `alt="${alt.replace(/\"/gm, "&quot;")}"` : "";
  return mdImage.replace(/!\[\[/gs, `<img src="${this.app.vault.adapter.basePath}/`).replace(/\]\]/gs, `" ${altString} />`).replace(/\|\d+/gs, "");
}

function replaceMdImages(content, alts) {
  let mdImages = content.match(/!\[\[.+\]\]/gs);
  if (mdImages) {
    let htmlImages = mdImages.map((img, index) => mdImageToHTMLImage(img, alts[index]));
    for (let i = 0; i < mdImages.length; i++) {
      content = content.replace(mdImages[i], htmlImages[i]);
    }
  }
  return content;
}

function removeFrontMatter(content) {
  return content.replace(/---.+---\s/s, "")
}

function linkMake(pathInVault, text) {
  let div = dv.el("div", text);
  let a = thisdv.container.createEl("a", { href: pathInVault, });
  a.setAttribute("data-tooltip-position", "top");
  a.setAttribute("aria-label", "home/index");
  a.setAttribute("data-href", "home/index");
  a.setAttribute("href", "home/index");
  a.setAttribute("target", "_blank");
  a.setAttribute("rel", "noopener");
  a.classList.add("internal-link");
  console.log(a);
  a.appendChild(div);
  
  // setTimeout(() => {
  //   div.firstChild.firstChild.classList.remove("internal-link");
  // }, 1000);
  // div["data-tooltip-position"] = "top";
  // div.ariaLabel = pathInVault;
  // div["data-href"] = pathInVault;
  // div.href = pathInVault;
  // div.target = "_blank";
  // div.rel = "noopener";
  return a;
  `<a data-tooltip-position="top" aria-label="home/index" data-href="home/index" href="home/index" target="_blank" rel="noopener">`
}

(async () => {
  pages = pages.sort(page => page.file.name, "ASC");
  let data = {};
  
  for (let i = 0; i < limit; i++) {
    let page = pages[i];
		let content = await dv.io.load(page.file.path);
    page.content = replaceMdImages(content, [page.alt]);
    data[page.name] = page;
	}
  
  pages.forEach((page) => {
    let artworkDiv = dv.el("div", "");
    let leftDiv = dv.el("div", "");
    let rightDiv = dv.el("div", "");
    let image = page.content.match(/finalVersion:.+$/m)[0].replace(/(finalVersion: ")|("$)/gm, "");
    let imageDiv = dv.el("div", image);
    let mdLinkDiv = dv.el("div", `[[${page.file.link.path}|:luc_link:]]`);
    mdLinkDiv.classList.add("markdown-embed-link");
    // mdLinkDiv.ariaLabel = "Open link";
    // mdLinkDiv.href = `${this.app.vault.adapter.basePath}/home/index`;
    //let imgDiv = dv.el("div", "");
    
    
    let titleDiv = dv.el("div", "");
    let aliasesDiv = dv.el("div", "");
    let descriptionDiv = dv.el("div", "");
    let parentFactionsDiv = dv.el("div", "");
    let contributorsDiv = dv.el("div", "");
    let finalCoordsDiv = dv.el("div", "");
    
    aliasesDiv.appendChild(dv.el("div", page.aliases ? page.aliases.filter(a => a != page.name).map(a => `${a}`).join(", ") : ""));
    descriptionDiv.appendChild(dv.span(page.alt ? page.alt : "No Description"));
    parentFactionsDiv.appendChild(dv.span("**Factions:**"));
    parentFactionsDiv.appendChild(dv.el("div", page.parentFactions ? page.parentFactions.map(a => `- **${a}**`).join("\n") : "- None Listed"));
    contributorsDiv.appendChild(dv.span("**Contributors:**"));
    contributorsDiv.appendChild(dv.el("div", page.contributors ? page.contributors.map(a => `- *${a}*`).join("\n") : "- No Individuals Listed"));
    finalCoordsDiv.appendChild(dv.span("**Final Coordinates:** "));
    finalCoordsDiv.appendChild(dv.el("span", page.finalCoordinates ? `${page.atlasLink ? `[${page.finalCoordinates}](${page.atlasLink})` : page.finalCoordinates}` : "- Not Listed"));


    //titleDiv.appendChild(dv.header(3, `[[${page.file.link.path}|${page.name}]]`));
    titleDiv.appendChild(dv.header(3, page.name));
    titleDiv.appendChild(aliasesDiv);
    titleDiv.appendChild(descriptionDiv);
    leftDiv.appendChild(titleDiv);
    leftDiv.appendChild(parentFactionsDiv);
    leftDiv.appendChild(contributorsDiv);
    leftDiv.appendChild(finalCoordsDiv);
    
    rightDiv.appendChild(mdLinkDiv);
    rightDiv.appendChild(imageDiv);
    artworkDiv.appendChild(leftDiv);
    artworkDiv.appendChild(rightDiv);
    
    mdLinkDiv.classList.add("custom-icon");
    mdLinkDiv.classList.add("artwork-md-link");
    titleDiv.classList.add("artwork-title");
    aliasesDiv.classList.add("artwork-aliases");
    leftDiv.classList.add("leftDiv");
    rightDiv.classList.add("rightDiv");
    imageDiv.classList.add("artwork-img");
    artworkDiv.classList.add("artwork-div");
  });

})();
