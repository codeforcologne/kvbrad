#Installationsbeschreibung

Hier wird beschrieben, wie die vollständige Anwendung 'KVB Fahrräder in Köln' installiert wird. Es werden sämtliche Tools genannt, sowie auf die einzelnen Services eingegangen.

Voraussetzung ist ein frisch aufgesetztes Ubuntu 14.04 Server. Für die Installation der Anwendung werden die Sourcen von github heruntergeladen und mit maven gebaut. Die Anwendung ist in Java geschrieben und benötigt neben Java, Maven, Tomcat, PostgreSQL mit PostGis auch einen Graphhopper Service. Im folgenden werden folgende Tools installiert:

1. java
2. maven
3. git
4. tomcat
5. graphhopper
6. postgresql/ postgis
7. services

## java installieren

vgl.: [Downloading Java JDK on Linux via wget is shown license page instead](http://stackoverflow.com/questions/10268583/downloading-java-jdk-on-linux-via-wget-is-shown-license-page-instead)

java im Verzeichnis /opt installieren

    cd /opt

    sudo wget --no-check-certificate --no-cookies --header "Cookie: oraclelicense=accept-securebackup-cookie" http://download.oracle.com/otn-pub/java/jdk/8u73-b02/jdk-8u73-linux-x64.tar.gz

Java entpacken

    sudo tar -xzf jdk-8u73-linux-x64.tar.gz

paket entfernen

    sudo rm jdk-8u73-linux-x64.tar.gz

rechten dem root zuweisen

    sudo chown -R root:root jdk1.8.0_73/

Java im System bekanntmachen

     sudo update-alternatives --install "/usr/bin/java" "java" "/opt/jdk1.8.0_73/bin/java" 1
     sudo update-alternatives --install "/usr/bin/javac" "javac" "/opt/jdk1.8.0_73/bin/javac" 1
     sudo update-alternatives --install "/usr/bin/javaws" "javaws" "/opt/jdk1.8.0_73/bin/javaws" 1
     sudo update-alternatives --install "/usr/bin/jar" "jar" "/opt/jdk1.8.0_73/bin/jar" 1
     sudo update-alternatives --set "java" "/opt/jdk1.8.0_73/bin/java"
     sudo update-alternatives --set "javac" "/opt/jdk1.8.0_73/bin/javac"
     sudo update-alternatives --set "javaws" "/opt/jdk1.8.0_73/bin/javaws"
     sudo update-alternatives --set "jar" "/opt/jdk1.8.0_73/bin/jar"

## maven installieren

    sudo apt-get install maven

## git installieren
    sudo apt-get install git

## tomcat installieren

tomcat im Verzeichnis /opt installieren

    cd /opt
    sudo wget http://apache.openmirror.de/tomcat/tomcat-8/v8.0.33/bin/apache-tomcat-8.0.33.tar.gz
    sudo tar -xzf apache-tomcat-8.0.33.tar.gz
    sudo rm apache-tomcat-8.0.33.tar.gz

user tomcat anlegen

    sudo adduser tomcat

anlegen eines symbolischen links für tomcat

    sudo chown -R tomcat:tomcat apache-tomcat-8.0.33/
    sudo ln -s apache-tomcat-8.0.33 tomcat
    sudo su - tomcat

kopieren der postgres libs in das tomcat-Verzeichnis

    wget http://central.maven.org/maven2/net/postgis/postgis-jdbc/2.1.7.2/postgis-jdbc-2.1.7.2.jar
    mv postgis-jdbc-2.1.7.2.jar /opt/tomcat/lib
    wget http://central.maven.org/maven2/org/postgresql/postgresql/9.3-1100-jdbc41/postgresql-9.3-1100-jdbc41.jar
    mv postgresql-9.3-1100-jdbc41.jar /opt/tomcat/lib

Konfiguration Datenbank Verbindung

Folgende Parameter müssen im Server gesetzt sein, damit die Services die Datenbank erkennen können:

context.xml

    vi /opt/tomcat/conf/context.xml

    <Context>
        <ResourceLink
             name="jdbc/kvbrad"
             global="jdbc/kvbrad"
             type="javax.sql.DataSource" />
    </Context>

server.xml

    vi /opt/tomcat/conf/server.xml

    <GlobalNamingResources>
        <Resource
            name="jdbc/kvbrad"
            auth="Container"
            driverClassName="org.postgresql.Driver"
            maxTotal="25"
            maxIdle="10"
            username="username"
            password="password"
            type="javax.sql.DataSource"
            url="jdbc:postgresql://localhost:5432/kvbrad"
            validationQuery="select 1"/>

web.xml

Um anderen Web-Applikationen den Zugriff auf die Services zu ermöglichen, wird im Apache der CorsFilter aktiviert. Der Eintrag erfolgt im Bereich 'Built In Filter Mappings' der web.xml

    <filter>
        <filter-name>CorsFilter</filter-name>
        <filter-class>org.apache.catalina.filters.CorsFilter</filter-class>
    </filter>
    <filter-mapping>
        <filter-name>CorsFilter</filter-name>
        <url-pattern>/*</url-pattern>
    </filter-mapping>

# graphhopper

Graphhopper wird, wie die anderen Tools im Verzeichns /opt installiert. Nach der Installation wird der user graphhopper eingerichtet und mit ihm der Service betrieben. Diese Installation setzt lediglich die Bereich des Regierungsbezirk Köln voraus. Für größere Bereiche muss der zugewiesene Speicher erhöht der entsprechende Bereich von geofabrik heruntergeladen werden.

    cd /opt

## Installation

_ZZZ_: TBD

    sudo git clone https://github.com/graphhopper/graphhopper.git
    sudo chmod
    sudo adduser graphhopper
    sudo chown -R graphhopper:graphhopper graphhopper/
    sudo su - graphhopper
    cd /opt/graphhopper
    wget http://download.geofabrik.de/europe/germany/nordrhein-westfalen/koeln-regbez-latest.osm.pbf

starten des Services; 'nohup &' erlauben nach dem Start des Serivces, sich abzumelden.

    export JAVA_OPTS="-Xmx256m -Xms256m -server -XX:+HeapDumpOnOutOfMemoryError"
    ./graphhopper.sh web koeln-regbez-latest.osm-gh nohup &

## alterative

Graphhopper kann auf einem schnellen Rechhner vorbereitet werden; es werden dann bin und data heruntergeladen

Graphhopper in ein tar.gz packen

    sudo tar -czf graphhopper.tar.gz graphhopper/

Danach an geeigneter Stelle herunterladen, entpacken und Benutzerrechte setzen

    sudo wget http://myserver/graphhopper.tar.gz
    sudo tar -xzf graphhopper.tar.gz
    sudo adduser graphhopper
    sudo chown -R graphhopper:graphhopper graphhopper/
    sudo su - graphhopper
    cd /opt/graphhopper

starten des Services; 'nohup &' erlauben nach dem Start des Serivces, sich abzumelden.

    export JAVA_OPTS="-Xmx256m -Xms256m -server -XX:+HeapDumpOnOutOfMemoryError"
    ./graphhopper.sh web koeln-regbez-latest.osm-gh nohup &

## Datenbank installieren

vgl.: [Howto install Postgresql and PostGIS on Ubuntu Trusty 14.04 with secure tunnel for connections](http://www.saintsjd.com/2014/08/13/howto-install-postgis-on-ubuntu-trusty.html)

PostGres installieren

    sudo apt-get update
    sudo apt-get install -y postgresql postgresql-contrib
    sudo apt-get install -y postgis postgresql-9.3-postgis-2.1

User anlegen (password muss gesetzt werden)

    sudo -u postgres createuser -P kvbrad

Datenbank anlegen und user zuweisen

    sudo -u postgres createdb -O kvbrad kvbrad

postgis hinzufügen

    sudo -u postgres psql -c "CREATE EXTENSION postgis; CREATE EXTENSION postgis_topology;" kvbrad

Anmelden an der Datenbank (abmelden mit '\q'; OSX: SHIFT + ALT + 7 q)

    psql -h localhost -U kvbrad kvbrad

## Services installieren

Voraussetzung:
- angemeldet als tomcat
- tomcat - home-verzeichnis als Arbeitsverzeichnis

kvbradlive

    git clone https://github.com/codeforcologne/kvbradlive.git
    psql -h localhost -U kvbrad -d kvbrad -a -f kvbradlive/src/main/sql/kvbradlive.init.sql
    cd kvbradlive
    mvn clean install
    chmod 775 target/kvbradlive.war
    cp target/kvbradlive.war /opt/tomcat/webapps

kvbradrouting

    git clone https://github.com/codeforcologne/kvbradrouting.git
    psql -h localhost -U kvbrad -d kvbrad -a -f kvbradrouting/src/main/sql/kvbradrouting.init.sql
    cd kvbradrouting
    mvn clean install
    chmod 775 target/kvbradrouting.war
    cp target/kvbradrouting.war /opt/tomcat/webapps

kvbradanalysis

    git clone https://github.com/codeforcologne/kvbradanalysis.git
    psql -h localhost -U kvbrad -d kvbrad -a -f kvbradanalysis/src/main/sql/kvbradanalysis.init.sql
    cd kvbradanalysis
    cp src/main/resources/config.properties.template src/main/resources/config.properties    
    cp src/test/resources/jndi.properties.template src/test/resources/jndi.properties
    mvn clean install
    chmod 775 target/kvbradanalysis.war
    cp target/kvbradanalysis.war /opt/tomcat/webapps

kvbradpositions

    git clone https://github.com/codeforcologne/kvbradpositions.git
    cd kvbradpositions
    cp src/main/resources/config.properties.template src/main/resources/config.properties
    mvn clean install
    chmod 775 target/kvbradpositions.war
    cp target/kvbradpositions.war /opt/tomcat/webapps

kvbrad

    git clone https://github.com/codeforcologne/kvbrad.git
    cd kvbrad
    mvn clean install
    chmod 775 target/kvbrad.war
    cp target/kvbrad.war /opt/tomcat/webapps

## Services in cron einbinden

Für regelmäßige updates muss crontab angepasst werden. Da ich mit vi besser zurechtkomme, als mit nano, verwende ich hier den vim:

    sudo EDITOR=vim.tiny crontab -e

Folgende Einträge müssen vorgenommen werden.

    */10 * * * * curl -X PUT http://localhost:8080/kvbradlive/service/put
    3 2 * * * curl -X PUT http://localhost:8080/kvbradrouting/service/put
    3 3 * * * curl -X PUT http://localhost:8080/kvbradanalysis/service/put
    2 2 * * * curl -X DELETE http://localhost:8080/kvbradrouting/service/delete
    2 2 * * * curl -X DELETE http://localhost:8080/kvbradlive/service/delete

## Services aktualisieren

Voraussetzung:
- angemeldet als tomcat
- sourcen bereits gecloned
- tomcat - home-verzeichnis als Arbeitsverzeichnis

kvbradlive

    cd kvbradlive
    git pull
    mvn clean install
    chmod 775 target/kvbradlive.war
    cp target/kvbradlive.war /opt/tomcat/webapps

kvbradrouting

    cd kvbradrouting
    git pull
    mvn clean install
    chmod 775 target/kvbradrouting.war
    cp target/kvbradrouting.war /opt/tomcat/webapps

kvbradanalysis

    cd kvbradanalysis
    git pull
    mvn clean install
    chmod 775 target/kvbradanalysis.war
    cp target/kvbradanalysis.war /opt/tomcat/webapps

kvbradpositions

    cd kvbradpositions
    git pull
    mvn clean install
    chmod 775 target/kvbradpositions.war
    cp target/kvbradpositions.war /opt/tomcat/webapps

kvbrad

    cd kvbrad
    git pull
    mvn clean install
    chmod 775 target/kvbrad.war
    cp target/kvbrad.war /opt/tomcat/webapps
