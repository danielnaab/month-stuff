# Month Stuff
This project is in-progress. Don't expect it to work without headaches.

## Info
This project is a [virtual-dom] application built with the
[Mercury Framework]. It implements a "build your own gift of the month
club", using [amazon.com] as a data source.

The application will email you notifications, on a schedule, to purchase items
on your list. You may create lists without authentication, or fork existing
lists.

## Set up
```shell
npm install
```

## Environment Configuration
The following environment variables are expected by the server:
- AWS_ID
- AWS_SECRET
- AMAZON_ASSOC_ID (optional)

Optionally, you may set `NODE_ENV` to one of:
- development (default)
- production
- test

## Development Server
```shell
gulp watch
```

[virtual-dom]: https://github.com/Matt-Esch/virtual-dom
[Mercury Framework]: https://github.com/Raynos/mercury
[amazon.com]: http://www.amazon.com
