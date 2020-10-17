# LibQuality

LibQuality is a system that is able to retrieve real time information about
GitHub projects.


## Requirements

- NodeJS >= 10
- npm >= 6
- Docker
- Docker-compose


## Testing LibQuality

Execute `npm install` to install the required libraries and `npm test` to test
LibQuality. The developed services (*repository* and *issues*) will be tested,
and if the test is successful all unit tests will pass. *nyc* is also used on
testing, so the coverage will also be evaluated.


## Running the solution:

Create a personal token if you do not have one and add it on **GITHUB_TOKEN**
inside *.env*. Then, execute `docker-compose up -d` to run the system, that will
be exposed on port 8000 of your machine. If you want to modify this port, change
**PORT** of *.env* file.

After the system is ready (execute `docker logs libquality` and verify by the
logs if the NodeJS program is running), you can make requests to LibQuality.
Above there are some examples using *curl* (you must observe that the repository
to be searched must be URL encoded, like *react native* that is encoded to
*react%20native*):

`curl "http://localhost:8000/v1/issues/vue/count"`
`curl "http://localhost:8000/v1/issues/react%20native/stats"`
`curl "http://localhost:8000/v1/issues/angular/hist"`


## Documentation

*openapi.yml* is an Open API file that presents the endpoints of LibQuality and
*libquality.pdf* contains the architecture of LibQuality.

The code of LibQuality is also documented with ideas about the development and
extension for new features.


## Important notes

LibQuality is developed to be fast, retrieving information from GitHub as fast
as possible. This way, */issues/:repo/hist* will just return historical data of
issues after the time its data is started to be collected.
