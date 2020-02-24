PoTree uses 8th of nodes, Poisson smapling divides the node up, but has different results based on how many divisions. Points can be next to each on boundaries, unless we check all adjacent cells.

Compulationaly expensive

We want to figure out if a point fits in a node. If a point is too close to its neighbours, then it's best it goes down to the next Octree layer. There's no point in showing more detail than can be seen.

Node boundaries. Per-node or per-level?
Data is surface types, clustering in 2D, avoid simple radius clusters.
Want a parallel algorithm
Now somewhat the min density we want, which is good for choosing initial params
Needs to be fast to operation of large data sets
Out-of-core: Easily serializable
Doesn't have to be perfect.


Algorithms:
- K-Means: O(n). Cluster based on distance to a randomly selected point.
- Mean shift. Iteratively move a window to higher and higher densities of points.
- DBSCAN
- Expectation-Maximization using Gaussian Mixture Models: Like K-Means but use a standard deviation to give elliptical shapes.



From this page: https://towardsdatascience.com/the-5-clustering-algorithms-data-scientists-need-to-know-a36d136ef68. DBSACN gives the best results for point cloud type data.


Overview of clustering types: https://www.analyticsvidhya.com/blog/2016/11/an-introduction-to-clustering-and-different-methods-of-clustering/



Need to use a density based scan to get non-spherical clusters.


Choosing points:
- Closest to grid center.
- Furthest from each other.


We have jobs and fast burst maths

Clustering:
Until all done:
    Choose point
    Points -> Find all with in range of point -> Cluster number (bit field)

For a point p1
Assign cluster number to p1
foreach point, p2
    if within range: assign cluster number to p2 and p1
foreach point
    if points has matching cluster number, assign to first cluster number
