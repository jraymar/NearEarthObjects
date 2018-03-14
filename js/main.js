(function() {
    var NEOWS_URL = "http://www.neowsapp.com/rest/v1/";

    var $NeoInfo = function(neo) {
        $.extend(this, $(
            '<div class="danger">' + '<h2>' + ((neo.is_potentially_hazardous_asteroid)? 'Hazardous' : 'Not Hazardous') + '</h2>' + '</div>' +
            '<div class="cardHolders">' +
                '<div class="card"><p>Miss Distance</p><h2>' + neo.close_approach_data[0].miss_distance.miles + ' mi</h2></div>' +
                '<div class="card"><p>Relative Velocity</p><h2>' + roundTwoPlaces(neo.close_approach_data[0].relative_velocity.miles_per_hour) + ' mph</h2></div>' +
                '<div class="card"><p>Max Diameter (est)</p><h2>' + roundTwoPlaces(neo.estimated_diameter.miles.estimated_diameter_max) + ' mi</h2></div>' +
                '<div class="card"><p>Min Diameter (est)</p><h2>' + roundTwoPlaces(neo.estimated_diameter.miles.estimated_diameter_min) + ' mi</h2></div>' +
                '<div class="card"><p>Inclination</p><h2>' + roundTwoPlaces(neo.orbital_data.inclination) + '</h2></div>' +
                '<div class="card"><p>Absolute Magnitude</p><h2>' + neo.absolute_magnitude_h + '</h2></div>' +
                '<div class="card"><p>Orbit Determination Date</p><h2>' + neo.orbital_data.orbit_determination_date + '</h2></div>' +
                '<div class="card"><p>Perihelion Distance</p><h2>' + roundTwoPlaces(neo.orbital_data.perihelion_distance) + '</h2></div>' +
                '<div class="card"><p>Aphelion Distance</p><h2>' + roundTwoPlaces(neo.orbital_data.aphelion_distance) + '</h2></div>' +
            '</div>'
        ));
        if(neo.is_potentially_hazardous_asteroid) {
            $(this).find(".danger").addBack(".danger").addClass('hazardous');
        }
    };

    var $NeoCloseup = function(neo) {
        var BASE_VW = 5;
        var d = neo.estimated_diameter.meters.estimated_diameter_max;
        var $closeup = $('<div></div>');
        $closeup.append($("<div class=\"neoCloseup\"></div>")
        .css("height", (BASE_VW + Math.log(d)) + "vw")
        .css("width",  (BASE_VW + Math.log(d)) + "vw"));
        $closeup.append('<h1><a href="' + neo.nasa_jpl_url + '">' + 'Near Earth Object - ' + neo.name + '</a></h1>');
        $.extend(this, $closeup);
    };

    var $Neo = function(neo) {
        var self = this;
        this.neo = neo;
        $.extend(this, $(
            '<div class="orbitPosition">\n' +
                '<span class="neoLabel">' + neo.name + '</span>\n' +
                '<div class="orbit">\n' +
                    '<div class="neo"></div>\n' +
                '</div>\n' +
            '</div>')
            .on("click", function() {
                console.log(neo);
                $(".neoCloseupWrapper").html(new $NeoCloseup(neo));
                $(".neoInfo").html(new $NeoInfo(neo));
                $(".neoModal").fadeIn(1000);
            })
        );
        $(this).find(".orbit").css("animation-duration", 15 - Math.log(neo.close_approach_data[0].relative_velocity.kilometers_per_hour) + "s");
        if(neo.is_potentially_hazardous_asteroid) {
            $(this).addClass('hazardous');
        }
    };

    var getFeed = function(date) {
        return $.ajax({
            url: NEOWS_URL + "/feed?start_date=" + date + "&end_date=" + date + "&detailed=true",
            method: "GET"
        });
    };

    var roundTwoPlaces = function(decimal) {
        return Number.parseFloat(decimal).toFixed(2);
    };

    var createOrbits = function(neos) {
        var $orbits = $(".orbits");
        var BASE_VW = 38;
        for(var i in neos) {
            var $neo = new $Neo(neos[i]);
            $orbits.append($neo);
            $neo.css("height", (BASE_VW + i * 5) + "vw");
            $neo.css("width",  (BASE_VW + i * 5) + "vw");
            $neo.css("z-index", 100 - i);
        }
    };

    var sortByMissDistance = function(neoA, neoB) {
        if (neoA.close_approach_data[0].miss_distance.lunar < neoB.close_approach_data[0].miss_distance.lunar)
            return -1;
        if (neoA.close_approach_data[0].miss_distance.lunar > neoB.close_approach_data[0].miss_distance.lunar)
            return 1;
        return 0;
    };

    $(document).ready(function() {
        var $day = $("#day");
        for(var i=1; i <= 31; i++) {
            var dayVal = i;
            if(dayVal < 10) dayVal = "0" + i
            $day.append($("<option>").val(dayVal).html(dayVal));
        }

        $(".neoModal .close").on("click", function() {
            $(".neoModal").fadeOut(1000);
        });

        $(".warning-bubble .close").on("click", function() {
            $(".warning-bubble").fadeOut(1000);
        });

        $(".earth").on("click", function() {
            $(".warning-bubble").fadeIn(1000);
        });

        $(".birthdayWrapper button").on("click", function(e) {
            var date = "2017-" + $("#month").val() + "-" + $("#day").val();
            var request = getFeed(date);
            request.done(function(response) {
                var neos = response.near_earth_objects[date];
                var hazardCount = 0;
                for(var i in neos) {
                    if(neos[i].is_potentially_hazardous_asteroid) {
                        hazardCount++;
                    }
                }
                var warningContent = 'Thankfully, On your birthday in 2017, <a href="https://ssd.jpl.nasa.gov">NASA JPL</a> did not detect any near earth objects. Stay vigilant earthling.'
                if(neos.length > 0) {
                    warningContent = 'On your birthday in 2017, <a href="https://ssd.jpl.nasa.gov">NASA JPL</a> detected ' +
                                      neos.length + ' Near Earth Objects, <span style="color:red">' + hazardCount + '</span> of which were hazardous.'
                    if(hazardCount == 0) {
                        warningContent += ' That doesn\'t mean danger ins\'t out there though.';
                    }
                }
                $(".warning-content").html(warningContent);
                neos.sort(sortByMissDistance);
                createOrbits(neos);
                $(".birthdayWrapper").fadeOut(1000, function() {
                    $(".orbitsWrapper").fadeIn(1000);
                });
            });
        });
    });
}());
