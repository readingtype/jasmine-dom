/*jsl:declare jasmine*/
/*jsl:declare Sizzle*/
/*jsl:declare Prototype*/
/*jsl:declare jQuery*/

jasmine.DOM = {};

jasmine.DOM.browserTagCaseIndependentHtml = function(html)
{
  var div= document.createElement('div');
  div.innerHTML= html;
  return div.innerHTML;
}

jasmine.DOM.elementToString = function(element)
{
  var div= document.createElement('div');
  div.appendChild(element.cloneNode(true));
  return div.innerHTML;
}

jasmine.DOM.trim= function(string)
{
  if (typeof string === "string") {
    var str= string.replace(/^\s+/, '');
    for (var i = str.length - 1; i > 0; --i)
      if (/\S/.test(str.charAt(i)))
      {
        str = str.substring(0, i + 1);
        break;
      }
    return str;
  }
  throw new TypeError("jasmine.DOM.trim expects a string");
}

jasmine.DOM.slice= function(arrayLike, startIndex)
{
  return [].slice.call(arrayLike, startIndex||0);
}

jasmine.DOM.uniqueId= 1;
jasmine.DOM.assignId= function(element)
{
  return element.id || (element.id=('jasmine_id_' + jasmine.DOM.uniqueId++));
};

/**
  jasmine.DOM.queryAll(selector[, scope]) -> array
 */ 
jasmine.DOM.queryAll= (function(){
  if ('undefined'!==typeof(Sizzle))
    return Sizzle;
  if ('undefined'!==typeof(Prototype))
    return function(selector, node)
    {
      return Element.getElementsBySelector(node||document, selector);
    };
  if ('undefined'!==typeof(jQuery))
    return function(selector, node)
    {
      var result= jQuery(selector, node);
      var nodes= [];
      var len= result.length;

      for (var i=0; i<len; ++i)
        nodes.push(result[i]);
      return nodes;
    };
  if (document.querySelectorAll)
    return function(selector, node)
    {
      if (!node)
        node= document;
      else if (node!==document)
        selector = ['#', jasmine.DOM.assignId(node), ' ', selector].join('');
      return jasmine.DOM.slice(node.querySelectorAll(selector));
    };
    
  throw new Error("Can't determine selector engine...");
})();



jasmine.DOM.matchers = {};


(function(){
  var matchers = {

    toHaveClass: function() {
      function toHaveClass () {
        return {
          compare: function (actual, class_name) {
            var classes = function (actual) { return jasmine.DOM.trim(actual.className).split(" "); };
            var pass = actual.hasOwnProperty("className") && classes(actual).indexOf(class_name) != -1;
            return {
              pass: pass
            }
          }
        }
      }
      return toHaveClass;
    },

    toBeVisible: function() {
      function toBeVisible () {
        return {
          compare: function (actual) {
            var pass = !((0 === actual.offsetWidth && 0 === actual.offsetHeight)
                  || actual.style.visibility == 'hidden');
            return {
              pass: pass
            }
          }
        }
      }
      return toBeVisible;
    },

    toBeHidden: function() {
      function toBeHidden () {
        return {
          compare: function (actual) {
            var pass = ((0 === actual.offsetWidth && 0 === actual.offsetHeight)
                  || actual.style.visibility == 'hidden');
            return {
              pass: pass
            }
          }
        }
      }
      return toBeHidden;
    },

    toBeSelected: function() {
      function toBeSelected () {
        return {
          compare: function (actual) {
            var pass = actual.selected;
            return {
              pass: pass
            }
          }
        }
      }
      return toBeSelected;
    },

    toBeChecked: function() {
      function toBeChecked () {
        return {
          compare: function (actual) {
            var pass = actual.checked;
            return {
              pass: pass
            }
          }
        }
      }
      return toBeChecked;
    },

    toBeEmpty: function() {
      function toBeEmpty () {
        return {
          compare: function (actual) {
            var pass = (!actual.firstChild);
            return {
              pass: pass
            }
          }
        }
      }
      return toBeEmpty;
    },

    toExist: function() {
      function toExist () {
        return {
          compare: function (actual) {
            var pass = (!!actual);
            return {
              pass: pass
            }
          }
        }
      }
      return toExist;
    },

    toHaveAttr: function () {
      function toHaveAttr () {
        return {
          compare: function (actual, attributeName, expectedAttributeValue) {
            var pass;
            if (!actual.hasAttribute(attributeName)) {
              pass = false;
            }
            else {
              pass = comparePropertyValues(actual.getAttribute(attributeName), expectedAttributeValue);
            }
            return {
              pass: pass
            }
          }
        }
      }
      return toHaveAttr;
    },

    toHaveId: function() {
      function toHaveId () {
        return {
          compare: function (actual, id) {
            var pass = (actual.id === id);
            return {
              pass: pass
            }
          }
        }
      }
      return toHaveId;
    },

    toHaveHtml: function() {
      function toHaveHtml () {
        return {
          compare: function (actual, html) {
            var pass = (actual.innerHTML === jasmine.DOM.browserTagCaseIndependentHtml(html));
            return {
              pass: pass
            }
          }
        }
      }
      return toHaveHtml;
    },

    toHaveText: function() {
      function toHaveText () {
        return {
          compare: function (actual, text) {
            var pass = ((actual.textContent || actual.innerText) === text);
            return {
              pass: pass
            }
          }
        }
      }
      return toHaveText;
    },

    toHaveValue: function() {
      function toHaveValue () {
        return {
          compare: function (actual, value) {
            console.log("actual", actual);
            var pass = (actual.value === value);
            return {
              pass: pass
            }
          }
        }
      }
      return toHaveValue;
    },

    toMatchSelector: function() {
      function toMatchSelector () {
        return {
          compare: function (actual, selector) {
            var pass;
            // This isn't efficient
            var nodes = jasmine.DOM.queryAll(selector);
            pass = (nodes.indexOf(actual) != -1);
            return {
              pass: pass
            }
          }
        }
      }
      return toMatchSelector;
    },
    toContainNode: function() {
      function toContainNode () {
        return {
          compare: function (actual, selector) {
            var nodes= jasmine.DOM.queryAll(selector, actual);
            return {
              pass: nodes.length > 0
            };
          }
        }
      }
      return toContainNode;
    }
  };

  function comparePropertyValues(actualValue, expectedValue)
  {
    if (void(0) === expectedValue)
      return void(0) !== actualValue;
    return actualValue == expectedValue;
  }

  function bindMatcher(methodName) {
    if (jasmine.version.split(".")[0] == "1") {
      // this code will never be run, but I have not yet found out what it all does
      // so I'm going to include it in the function in case that helps
      var originalMatcher = jasmine.matchers[methodName];
            jasmine.DOM.matchers[methodName] = function()
      {
        //  If the actual value is a DOM node...
        if (this.actual && this.actual.nodeType)
        {
          var result = matchers[methodName].apply(this, arguments);
          this.actual = jasmine.DOM.elementToString(this.actual);
          return result;
        }

        if (originalMatcher)
          return originalMatcher.apply(this, arguments);

        return false;
      }

    }
    if (jasmine.version.split(".")[0] == "2") {
      var originalMatcher = jasmine.matchers[methodName];

      if (originalMatcher) {
        // I don't yet understand why an original matcher with the same name
        // would be kept rather than raising an error
        console.log("Discarding core matcher ", methodName);
      }

      jasmine.DOM.matchers[methodName] = matchers[methodName]();
    }

  }

  for (var methodName in matchers)
    bindMatcher(methodName);
    
})();

beforeEach(function() {
  var jasmine_env = jasmine.getEnv();
  jasmine_env.addMatchers(jasmine.DOM.matchers);
});

afterEach(function() {
  jasmine.getFixtures().cleanUp();
});
