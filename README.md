# Get Me Home

## Overview
This is an experiment at building a mobile website with HTML5.  It's goal is to make it very easy to look up ways to get home via public transport, ideally without having to type anything into your phone or even know your current address.  All travel information is currently sourced from [Transport Info 131500](http://www.131500.com.au/about-us). Get Me Home can be considered an optimised version of their website, designed specifically for use with mobile phones.

## Technologies
 * [Sinatra](http://www.sinatrarb.com/)
 * [jQuery Mobile](http://jquerymobile.com/)
 * [Mustache](http://mustache.github.com/)

## Development

    git clone https://github.com/o-sam-o/getmehome.git
    cd getmehome
    bundle install
    shotgun config.ru

## Deployment

* Create an account in seconds at [Heroku](http://heroku.com/signup).
* If you do not have an SSH key
you'll need to [generate
one](http://heroku.com/docs/index.html#_setting_up_ssh_public_keys)
and [tell Heroku about
it](http://heroku.com/docs/index.html#_manage_keys_on_heroku)
* `heroku create --stack bamboo-mri-1.9.2 [optional-app-name]` (You can rename your app with `heroku rename`)
* `git push heroku master`

_Deployment instructions mostly copied from [heroku-sinatra-app](https://github.com/sinatra/heroku-sinatra-app)_

## TODO
 * Reverse Geo Accuracy seems poor
 * Map page
 * Improve view trip (scrap actual trip info)
 * Improve load time (Jammit)
 * Improve server lookup time, cache address ids

## Credits
* Icons: [http://www.picol.org/](http://www.picol.org/)
* Characters: [http://iconlibrary.iconshock.com/icons/free-icon-sets-55-user-icons-part-1/](http://iconlibrary.iconshock.com/icons/free-icon-sets-55-user-icons-part-1/)
* Bullet: [http://glyphish.com/](http://glyphish.com/)
