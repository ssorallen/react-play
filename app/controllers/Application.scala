package controllers

import java.io.InputStreamReader
import javax.script.ScriptEngineManager

import com.google.inject.Inject
import play.api.Environment
import play.api.mvc._

class Application @Inject()(implicit webJarAssets: WebJarAssets, env: Environment) extends Controller {

  def index = Action {
    // Pass 'null' to force the correct class loader. Without passing any param,
    // the "nashorn" JavaScript engine is not found by the `ScriptEngineManager`.
    //
    // See: https://github.com/playframework/playframework/issues/2532
    val engine = new ScriptEngineManager(null).getEngineByName("nashorn")

    if (engine == null) {
      BadRequest("Nashorn script engine not found. Are you using JDK 8?")
    } else {
      // React expects `window` or `global` to exist. Create a `global` pointing
      // to Nashorn's context to give React a place to define its global
      // namespace.
      engine.eval("var global = this;")

      // Define `console.log`, etc. to send messages to Nashorn's global `print`
      // function so the messages are written to standard out.
      engine.eval("var console = {error: print, log: print, warn: print};")

      // Evaluate React and the application code.
      engine.eval(new InputStreamReader(env.classLoader.getResource("public/lib/react/react-with-addons.js").openStream()))
      engine.eval(new InputStreamReader(env.classLoader.getResource("public/javascripts/components/App.js").openStream()))

      Ok(views.html.main("React on Play", webJarAssets) {
        play.twirl.api.Html(engine.eval("React.renderToString(React.createElement(App));").toString)
      })
    }
  }

}