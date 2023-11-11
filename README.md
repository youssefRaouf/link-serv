link-serv is a service built on top of a noSQL (MongoDB) data store capable of holding tens of billions of interlinked nodes that represent web resources and outlinks. The service exposes an API for inserting and retrieving link information.
At its core, the API looks as follows:
* /put:
   * Insert web resource
  (node) and list of
  outlinks (edges)
   * Parameters:
     * URL
     * time
     * outlinks as JSON
* /get:
   * Retrieve graph structure
  starting at given web
  resource (node)
   * Parameters:
      * URL
      * time
      * depth
   * Output:
     *  Nested outlinks up to
    depth as JSON

The primary challenge in implementing link-serv was implementing a robust store for linked data capable of scaling up. Part of the initial effort within this project was to go towards investigating noSQL alternatives and adapting the chosen data store to the project’s needs. Another challenge was to design an appropriate data schema for representing temporal web data in a graph data store.
