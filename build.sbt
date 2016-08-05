name := "play-react"

version := "1.0-SNAPSHOT"

scalaVersion := "2.11.8"

lazy val root = (project in file("."))
  .enablePlugins(PlayScala)

libraryDependencies ++= Seq(
  "org.webjars" %% "webjars-play" % "2.5.0-2",
  "org.webjars" % "react" % "0.13.1"
)
