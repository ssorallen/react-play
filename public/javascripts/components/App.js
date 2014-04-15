/* Hand compiled (if there is such a thing) by pasting the original JSX file
 * into http://facebook.github.io/react/jsx-compiler.html
 *
 * JSX source: https://github.com/ssorallen/react-reddit-client/blob/master/react-reddit-client.js
 */

var NavigationItem = React.createClass({displayName: 'NavigationItem',
  onClick: function() {
    this.props.itemSelected(this.props.item);
  },
  render: function() {
    return (
      React.DOM.li( {onClick:this.onClick, className:this.props.selected ? "selected" : ""}, 
        this.props.item.data.display_name
      )
    );
  }
});

var Navigation = React.createClass({displayName: 'Navigation',
  setSelectedItem: function(item) {
    this.props.itemSelected(item);
  },
  render: function() {
    var items = this.props.items
      .sort(function(a, b) {
        // Sort by # of subscribers in descending order
        return b.data.subscribers - a.data.subscribers;
      })
      .map(function(item) {
        return (
          NavigationItem(
            {item:item,
            itemSelected:this.setSelectedItem,
            key:item.data.id,
            selected:item.data.url === this.props.activeUrl} )
        );
      }, this);

    return (
      React.DOM.div( {className:"navigation"}, 
        React.DOM.div( {className:"header"}, "Navigation"),
        React.DOM.ul(null, 
            items
        )
      )
    );
  }
});

var StoryList = React.createClass({displayName: 'StoryList',
  render: function() {
    var storyNodes = this.props.items.map(function(item) {
      return (
        React.DOM.tr(null, 
          React.DOM.td(null, 
            React.DOM.p( {className:"score"}, item.data.score)
          ),
          React.DOM.td(null, 
            React.DOM.p( {className:"title"}, 
              React.DOM.a( {href:item.data.url}, 
                item.data.title
              )
            ),
            React.DOM.p( {className:"author"}, 
              "Posted by ", React.DOM.b(null, item.data.author)
            )
          )
        )
      );
    });

    return (
      React.DOM.table(null, 
        React.DOM.tbody(null, 
          storyNodes
        )
      )
    );
  }
});

var App = React.createClass({displayName: 'App',
  componentDidMount: function() {
    var _this = this;
    var cbname = "fn" + Date.now();
    var script = document.createElement("script");
    script.src = "http://www.reddit.com/reddits.json?jsonp=" + cbname;

    window[cbname] = function(jsonData) {
      _this.setState({
        navigationItems: jsonData.data.children
      });
      delete window[cbname];
    };

    document.head.appendChild(script);
  },
  getInitialState: function() {
    return ({
      activeNavigationUrl: "",
      navigationItems: [],
      storyItems: [],
      title: "Please select a sub"
    });
  },
  render: function() {
    return (
      React.DOM.div(null, 
        React.DOM.h1(null, this.state.title),
        Navigation(
          {activeUrl:this.state.activeNavigationUrl,
          items:this.state.navigationItems,
          itemSelected:this.setSelectedItem} ),
        StoryList( {items:this.state.storyItems} )
      )
    );
  },
  setSelectedItem: function(item) {
    var _this = this;
    var cbname = "fn" + Date.now();
    var script = document.createElement("script");
    script.src = "http://www.reddit.com/" + item.data.url +
      ".json?sort=top&t=month&jsonp=" + cbname;

    window[cbname] = function(jsonData) {
      _this.setState({storyItems: jsonData.data.children});
      delete window[cbname];
    };
    
    document.head.appendChild(script);

    this.setState({
      activeNavigationUrl: item.data.url,
      storyItems: [],
      title: item.data.display_name
    });
  }
});
