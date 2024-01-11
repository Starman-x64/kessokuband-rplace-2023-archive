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
    let artworkContainer = thisdv.container.createEl("div", { cls: ["artwork-container"] });
    // let tableContainer = dv.el("table", "");
    let leftDiv = thisdv.container.createEl("div", { cls: ["leftDiv"] });
    let rightDiv = thisdv.container.createEl("div", { cls: ["rightDiv"] });
    let image = page.content.match(/finalVersion:.+$/m)[0].replace(/(finalVersion: ")|("$)/gm, "");
    let imageDiv = dv.el("div", image);
    let mdLinkDiv = dv.el("div", `[[${page.file.link.path}|:luc_link:]]`);

    imageDiv.classList.add("artwork-img");
    mdLinkDiv.classList.add("markdown-embed-link");
    mdLinkDiv.classList.add("custom-icon");
    mdLinkDiv.classList.add("artwork-md-link");
    
    // mdLinkDiv.ariaLabel = "Open link";
    // mdLinkDiv.href = `${this.app.vault.adapter.basePath}/home/index`;
    //let imgDiv = dv.el("div", "");

    // let tableRow = dv.el("tr", "");
    // let tableLeft = dv.el("td", "");
    // let tableRight = dv.el("td", "");


    let titleDiv = thisdv.container.createEl("div", { cls: ["artwork-title"] });
    let aliasesDiv = thisdv.container.createEl("div", { cls: ["artwork-aliases"] });
    let descriptionDiv = thisdv.container.createEl("div", { cls: [] });
    let parentFactionsDiv = thisdv.container.createEl("div", { cls: [] });
    let contributorsDiv = thisdv.container.createEl("div", { cls: [] });
    let finalCoordsDiv = thisdv.container.createEl("div", { cls: [] });

    aliasesDiv.append(dv.el("div", page.aliases ? page.aliases.filter(a => a != page.name).map(a => `${a}`).join(", ") : ""));
    descriptionDiv.append(dv.span(page.alt ? page.alt : "No Description"));
    parentFactionsDiv.append(dv.span("**Factions:**"));
    parentFactionsDiv.append(dv.el("div", page.parentFactions ? page.parentFactions.map(a => `- **${a}**`).join("\n") : "- None Listed"));
    contributorsDiv.append(dv.span("**Contributors:**"));
    contributorsDiv.append(dv.el("div", page.contributors ? page.contributors.map(a => `- *${a}*`).join("\n") : "- No Individuals Listed"));
    finalCoordsDiv.append(dv.span("**Final Coordinates:** "));
    finalCoordsDiv.append(dv.el("span", page.finalCoordinates ? `${page.atlasLink ? `[${page.finalCoordinates}](${page.atlasLink})` : page.finalCoordinates}` : "- Not Listed"));


    //titleDiv.append(dv.header(3, `[[${page.file.link.path}|${page.name}]]`));
    titleDiv.append(dv.header(3, page.name));
    titleDiv.append(aliasesDiv);
    titleDiv.append(descriptionDiv);
    leftDiv.append(titleDiv);
    leftDiv.append(parentFactionsDiv);
    leftDiv.append(contributorsDiv);
    leftDiv.append(finalCoordsDiv);

    rightDiv.append(imageDiv);

    // tableLeft.append(leftDiv);
    // tableRight.append(rightDiv);
    
    // tableRow.append(tableLeft);
    // tableRow.append(tableRight);
    // tableContainer.append(tableRow);
    // artworkContainer.append(tableContainer);

    artworkContainer.append(leftDiv);
    artworkContainer.append(rightDiv);
    artworkContainer.append(mdLinkDiv);
    thisdv.container.append(artworkContainer);
    
    // setTimeout(() => {rightDiv.style.height = `${leftDiv.clientHeight - 50}px`;}, 1000);
    let pxPerEm = parseFloat(getComputedStyle(thisdv.container).fontSize);
    artworkContainer.style.height = `${(leftDiv.clientHeight - 50) / pxPerEm}em`;
    // tableLeft.classList.add("tableLeft");
    // tableRight.classList.add("tableRight");
    // tableContainer.classList.add("tableContainer");

    //thisdv.container.classList.add("artworks-view");
  });

})();
