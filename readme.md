#KVB Rad

Die Webapplikation soll die Benutzung von Wegen in Köln auf Basis der [Standorte Fahrradverleih Koeln - KVB-Rad](http://www.offenedaten-koeln.de/dataset/standorte-fahrradverleih-koeln-kvb-rad) mit dem Fahrrad verdeutlichen. Hierzu werden die Standorte der KVB-Fahrräder periodisch gespeichert und die Wege zwischen zwei gespeicherten Standorten über [Graphhopper](https://graphhopper.com/) auf Basis der OSM Daten geroutet. Die Ergebnisse des Routings können in Teilabschnitte aufgetrennt werden. Durch das Zählen der Teilabschnitte läßt sich die Nutzungsintensität von bestimmten Wegen für die Fahrräder bestimmen.

Grundlage für diesen Service sind die Services https://github.com/weberius/kvbradlive und https://github.com/weberius/kvbradpositions. Für diese Projekt  wird eine angepasste Version des [Bootleaf](https://github.com/bmcbride/bootleaf) Templates verwendet. 

## Entwicklungsstand

Dieser Service ist in Entwicklung.
