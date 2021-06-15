/*
VARIABLES
*/
var worldSvg;
var table;
var countryCount;
var infoPanel;



/*
SETUP
*/
function preload() {
  worldSvg = loadSVG(worldSvgPath);
  table = loadTable(dataCsv, "csv", "header");
}
function setup() {
  countryCount = table.getRowCount();
  fill(color(25,25,25));              // set website text color
  createMap();                        // create map elements
  drawMap();                          // draw map elements
}



/*
CREATE
*/
function createMap() {
  createCanvas(windowWidth, windowHeight - 4, SVG);
  createRibbon();
  createInfoPanel();
}
function createRibbon() {
  // create all groups
  for (let i = 0; i <= 8; i++) {
    let group = createDiv();
    group.id('groupDiv' + i);
    group.addClass('groupDiv');
    group.addClass('vaccine' + i);
    group.mouseOver(function() {
      document.getElementById('groupDiv' + i).classList.add('highlight');
      foreachCountry(highlightCountryByGroup, i);
    });
    group.mouseOut(resetHighlights);
  }
}
function createInfoPanel() {
  infoPanel = createDiv();
  infoPanel.id('infoPanel');
  infoPanel.hide();
}



/*
DRAW
*/
function windowResized() {
  resizeCanvas(windowWidth, windowHeight - 4);
  drawMap();
}
function drawMap() {
  drawHeader();
  drawRibbon();
  drawWorld();
}
function drawHeader() {
  textAlign(CENTER);
  textSize(34);
  text(title, windowWidth/2, 50);
  textSize(16);
  text(subtitle, windowWidth/2, 70);
}
function drawRibbon() {
  textSize(14);
  textAlign(LEFT);
  let groupHeight = windowHeight * 0.1;

  for (let i = 0; i <= 8; i++) {
    let yPos = i != 0 ? 10 + (i - 1) * groupHeight : windowHeight - 10 - groupHeight;
    let group = document.getElementById('groupDiv' + i);
    group.style.top = Math.round(yPos) + 'px';
    
    // group range label
    let varName = "group" + i + "End";
    let label = eval(varName) + (i != 0 ? "%" : "");
    text(label, 35, yPos + groupHeight + 4);
  }
}
function drawWorld() {
  image(worldSvg, 40, 80, windowWidth - 40, windowHeight - 85); // load world map
  foreachCountry(function(country, vaccineCount) {              // map colors to map
    country.classList.add(getColorByVaccineRate(vaccineCount));
  }, 0, false);
  foreachCountry(function(country) {                            // map events for interaction
    country.addEventListener("mouseover", mouseover);
    country.addEventListener("mouseleave", mouseleave);
  });
}
function drawInfoPanel(country) {
  let iso2 = country.id == "" ? country.parentElement.id : country.id;
  
  for (let i = 0; i < countryCount; i++) {
    let dataRecord = table.rows[i];
    if (dataRecord.get('iso_code') == iso2)
    {
      var countryName = dataRecord.get(countryNameColumn);
      var firstVaccinationRate = numberWithPoints(dataRecord.get(firstVaccinationRateColumn));
      var firstVaccination = numberWithPoints(dataRecord.get(firstVaccinationColumn));
      var fullVaccination = numberWithPoints(dataRecord.get(fullVaccinationColumn));
      break;
    }
  }

  let infoPanelText = '<p class="countryName">' + countryName + "</p>";
  if (firstVaccination != 0) {
    infoPanelText +=
      '<p class="percentage">' + firstVaccinationRate + "%</p>" +
      '<p class="subtest">first: ' + firstVaccination + "<br>" +
      "full: " + fullVaccination + '</p>';
  }
  else {
    infoPanelText += '<p class="percentage">no data</p>';
  }
  
  infoPanel.html(infoPanelText);

  let offset = 10;
  let xPos = mouseX + offset;
  if (xPos + infoPanel.width > windowWidth) xPos -= infoPanel.width + 2*offset;
  let yPos = mouseY - offset;
  if (mouseY > windowHeight/2) yPos -= 100 + 2*offset;
  infoPanel.position(xPos, yPos);
  infoPanel.show();
}



/*
EVENTS
*/
function mouseover(e) {
  e.target.classList.add("highlight");
  drawInfoPanel(e.target);
}
function mouseleave() {
  resetHighlights();
}



/*
INTERACTIVE VISUALS
*/
function highlightCountryByGroup(country, vaccineCount, groupIndex) {
  if ((groupIndex == 0 && vaccineCount == 0)
    || groupIndex == 1 && (vaccineCount < group1End && vaccineCount > 0)
    || groupIndex == 2 && (vaccineCount < group2End && vaccineCount >= group1End)
    || groupIndex == 3 && (vaccineCount < group3End && vaccineCount >= group2End)
    || groupIndex == 4 && (vaccineCount < group4End && vaccineCount >= group3End)
    || groupIndex == 5 && (vaccineCount < group5End && vaccineCount >= group4End)
    || groupIndex == 6 && (vaccineCount < group6End && vaccineCount >= group5End)
    || groupIndex == 7 && (vaccineCount < group7End && vaccineCount >= group6End)
    || groupIndex == 8 && vaccineCount >= group7End)
  {
    country.classList.add("highlight");
  }
  else country.classList.add("transparent");
}
function resetHighlights() {
  foreachCountry(function(country) {
    country.classList.remove("highlight", "transparent");
    [...country.children].forEach(child => child.classList.remove("highlight", "transparent"));
  });

  infoPanel.hide();

  // ribbon groups
  for (let i = 0; i <= 8; i++) {
    document.getElementById('groupDiv' + i).classList.remove("highlight");
  }
}



/*
HELPER FUNCTIONS
*/
function foreachCountry(doSomething, value = 0, all = true) {
  for (let i = 0; i < countryCount; i++) {
    // get data from table record
    let dataRecord = table.rows[i];
    let vaccineCount = dataRecord.get(firstVaccinationRateColumn);
    let iso_2 = dataRecord.get('iso_code');
    
    // get corresponding country element in svg
    let country = document.getElementById(iso_2);
    
    // skip if country not found
    if (country == null) continue;
    
    // do something if country exists
    if (all || vaccineCount > 0) doSomething(country, vaccineCount, value);
  }
}
function getColorByVaccineRate(value) {
  if      (value < group1End) return "vaccine1";
  else if (value < group2End) return "vaccine2";
  else if (value < group3End) return "vaccine3";
  else if (value < group4End) return "vaccine4";
  else if (value < group5End) return "vaccine5";
  else if (value < group6End) return "vaccine6";
  else if (value < group7End) return "vaccine7";
  else                        return "vaccine8";
}
function numberWithPoints(x) {
  return Number(x).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}