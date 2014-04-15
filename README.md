React.js on the Play Framework
==============================

* JDK8 shipped with a JavaScript runtime: [Nashorn](http://openjdk.java.net/projects/nashorn/)
* React JS supports server side rendering via
  [`React.renderComponentToString`](http://facebook.github.io/react/docs/top-level-api.html#react.rendercomponenttostring).
* The [Play Framework](http://playframework.com/) is a web framework that runs
  on the JVM

With these powers combined, Play can use the same JavaScript sent to the client
to render its templates on the server.

## To try it out:

1. Install [JDK8](http://www.oracle.com/technetwork/java/javase/downloads/jdk8-downloads-2133151.html) for your platform
2. Clone this repository
3. Follow the instructions to install and
   [get started with Play 2.2+](http://playframework.com/documentation/2.2.x/Home)
4. Run the app with `play run`
5. View [http://localhost:9000/](http://localhost:9000/) in your browser

### What am I looking at?

This app is using the JavaScript from my
[React Reddit Client](https://github.com/ssorallen/react-reddit-client) but with
one key, huge, fantastic change: the first view you see is rendered on the
server.

### The magic is in the Nashorn

The part that makes this all work is the Nashorn JavaScript engine that ships
with Java 8. By eval'ing components on the server, React can produce a string
that's rendereable as plain old HTML.

**The server:**

```scala
def index = Action {
  // Pass 'null' to force the correct class loader. Without passing any param,
  // the "nashorn" JavaScript engine is not found by the `ScriptEngineManager`.
  //
  // See: https://github.com/playframework/playframework/issues/2532
  val engine = new ScriptEngineManager(null).getEngineByName("nashorn")

  // React expects `window` or `global` to exist. Create a `global` pointing
  // to Nashorn's context to give React a place to define its global namespace.
  engine.eval("var global = this;")

  // Evaulate React and the application code.
  engine.eval(new FileReader("public/javascripts/react-with-addons-0.10.0.js"))
  engine.eval(new FileReader("public/javascripts/components/App.js"))

  Ok(views.html.main("React on Play") {
    templates.Html(engine.eval("React.renderComponentToString(App());").toString)
  })
}
```

The client receives the same React and App JavaScript files and executes the
same code the server did. Unlike most other use cases, it will be working on
pre-rendered HTML as opposed to an empty container.

**The client:**

```html
<div id="application">
  @content
</div>
<script src="@routes.Assets.at("javascripts/react-with-addons-0.10.0.js")"></script>
<script src="@routes.Assets.at("javascripts/components/App.js")"></script>
<script>
  React.renderComponent(
    App(),
    document.getElementById("application")
  );
</script>
```
