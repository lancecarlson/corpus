(function() {
  this.Project = Model("project");
  Project.hasMany("todo_lists");
  this.TodoList = Model("todo_list");
  TodoList.hasMany("todo_items");
  this.TodoItem = Model("todo_item");
  describe("Model instance", function() {
    return describe("attributes", function() {
      beforeEach(function() {
        return this.project = new Project({
          name: "New Project"
        });
      });
      it("should let you get an attribute", function() {
        return expect(this.project.get("name")).toEqual("New Project");
      });
      return it("should let you set an attribute", function() {
        this.project.set("name", "Old Project");
        return expect(this.project._attributes["name"]).toEqual("Old Project");
      });
    });
  });
}).call(this);
