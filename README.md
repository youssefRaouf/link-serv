link-serv�is a service built on top of a noSQL (MongoDB) data store capable of holding tens of billions of interlinked nodes that represent web resources and outlinks. The service exposes an API for inserting and retrieving link information.
At its core, the API looks as follows:
API
(node) and list of
outlinks (edges)
time
outlinks as JSON
starting at given web
resource (node)
* time
* depth
depth as JSON
The primary challenge in implementing�link-serv�lies in implementing a robust store for linked data capable of scaling up. Part of the initial effort within this project is to go towards investigating noSQL alternatives and adapting the chosen data store to the project�s needs. Another challenge is to design an appropriate data schema for representing temporal web data in a graph data store.