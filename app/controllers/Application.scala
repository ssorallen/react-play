package controllers

import play.api._
import play.api.mvc._

import java.io.FileReader
import javax.script.ScriptEngineManager

object Application extends Controller {

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
      // to Nashorn's context to give React a place to define its global namespace.
      engine.eval("var global = this;")

      // Evaluate React and the application code.
      engine.eval(new FileReader("public/javascripts/bower_components/react/react-with-addons.js"))
      engine.eval(new FileReader("target/web/public/main/javascripts/components/App.js"))

      Ok(views.html.main("React on Play") {
        play.twirl.api.Html(engine.eval("React.renderToString(React.createElement(App));").toString)
      })
    }
  }

}
