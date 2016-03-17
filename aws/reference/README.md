This is a basic AWS reference app that has load balancing, an instance, and a database.

It currently has the following:

1. A terraform execution plan.
2. A SQL database schema that creates a table in our RDS MySQL database.
3. A simple REST api that can add and remove an item from the RDS database.

I will expand this to have the following as time permits:

1. Auto Scale groups.
2. Internal ELB in front of REST API.
3. External ELB.
4. Simple web site that more visualizes the adding and removing of items via call to internal ELB.
