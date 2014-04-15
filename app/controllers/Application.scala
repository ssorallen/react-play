package controllers

import play.api._
import play.api.mvc._

import java.io.FileReader
import javax.script.{ScriptEngine, ScriptEngineManager}

object Application extends Controller {

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

}
