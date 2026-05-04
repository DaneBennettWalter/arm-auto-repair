#!/bin/bash

# Create 19 more SEO posts quickly
POSTS=(
  "starter-problems-kingsville-tx:Starter Problems Kingsville TX:2024-08-20:starter repair Kingsville, car won't start, starter motor replacement"
  "serpentine-belt-replacement-ingleside:Serpentine Belt Replacement Ingleside:2024-09-10:serpentine belt Ingleside, belt replacement, squealing belt"
  "catalytic-converter-repair-aransas-pass:Catalytic Converter Repair Aransas Pass:2024-10-05:catalytic converter Aransas Pass, check engine light, emissions"
  "power-steering-problems-rockport:Power Steering Problems Rockport TX:2024-11-12:power steering Rockport, hard steering, steering fluid leak"
  "fuel-injector-cleaning-beeville:Fuel Injector Cleaning Beeville TX:2024-12-08:fuel injector Beeville, engine misfire, fuel system cleaning"
  "cabin-air-filter-replacement-alice:Cabin Air Filter Replacement Alice TX:2025-01-15:cabin air filter Alice, air filter replacement, HVAC filter"
  "abs-brake-problems-sinton:ABS Brake Problems Sinton TX:2025-02-22:ABS brake Sinton, brake warning light, anti-lock brakes"
  "coolant-leak-diagnosis-odem:Coolant Leak Diagnosis Odem TX:2025-03-10:coolant leak Odem, antifreeze leak, radiator leak"
  "spark-plug-replacement-taft:Spark Plug Replacement Taft TX:2025-04-18:spark plugs Taft, tune up, engine misfire"
  "oxygen-sensor-replacement-gregory:Oxygen Sensor Replacement Gregory TX:2025-05-25:oxygen sensor Gregory, O2 sensor, fuel economy"
  "cv-joint-repair-fulton:CV Joint Repair Fulton TX:2024-07-30:CV joint Fulton, clicking noise, axle repair"
  "exhaust-manifold-leak-driscoll:Exhaust Manifold Leak Driscoll TX:2024-08-15:exhaust manifold Driscoll, exhaust leak, ticking noise"
  "cruise-control-repair-bishop:Cruise Control Repair Bishop TX:2024-09-28:cruise control Bishop, cruise not working, speed control"
  "window-regulator-repair-mathis:Window Regulator Repair Mathis TX:2024-10-20:window regulator Mathis, power window repair, window won't roll up"
  "heater-core-replacement-san-patricio:Heater Core Replacement San Patricio:2024-11-18:heater core San Patricio, no heat, coolant smell"
  "ignition-coil-replacement-refugio:Ignition Coil Replacement Refugio TX:2024-12-22:ignition coil Refugio, engine misfire, rough idle"
  "blend-door-actuator-bayside:Blend Door Actuator Bayside TX:2025-01-28:blend door actuator Bayside, AC heat problem, clicking noise"
  "mass-airflow-sensor-cleaning-woodsboro:Mass Airflow Sensor Woodsboro TX:2025-02-14:mass airflow sensor Woodsboro, MAF sensor, poor acceleration"
  "egr-valve-replacement-skidmore:EGR Valve Replacement Skidmore TX:2025-03-30:EGR valve Skidmore, check engine light, emissions"
)

for POST in "${POSTS[@]}"; do
  IFS=: read slug title date keywords <<< "$POST"
  filename="${slug}.html"
  
  # Extract city from title
  city=$(echo "$title" | awk '{print $(NF-1), $NF}')
  
  cat > "$filename" << 'EOFPOST'
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title} | ARM Auto Repair</title>
    <meta name="description" content="Professional ${title,,} at ARM Auto Repair. ASE certified mechanics serving the Coastal Bend. Call (361) 220-1629.">
    <meta name="keywords" content="${keywords}">
    <script src="https://cdn.tailwindcss.com"></script>
    <script>tailwind.config={theme:{extend:{colors:{'arm-red':'#C8102E','arm-blue':'#1E3A5F','arm-navy':'#0D1B2A'}}}}</script>
</head>
<body class="font-sans antialiased">
    <header class="bg-white shadow-sm sticky top-0 z-50">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex justify-between items-center py-4">
                <a href="../index.html"><img src="../images/logo.png" alt="ARM Auto Repair" class="h-16"></a>
                <nav class="hidden md:flex space-x-8">
                    <a href="../index.html" class="text-gray-700 hover:text-arm-red font-medium">Home</a>
                    <a href="../services.html" class="text-gray-700 hover:text-arm-red font-medium">Services</a>
                    <a href="index.html" class="text-gray-700 hover:text-arm-red font-medium">Blog</a>
                    <a href="../index.html#contact" class="text-gray-700 hover:text-arm-red font-medium">Contact</a>
                    <a href="tel:3612201629" class="bg-arm-red text-white px-6 py-2 rounded-lg hover:bg-red-700 transition font-semibold">(361) 220-1629</a>
                </nav>
            </div>
        </div>
    </header>
    <main class="py-16 bg-gray-50">
        <article class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <header class="mb-12 text-center">
                <h1 class="text-5xl font-bold mb-4 text-arm-navy">${title}</h1>
                <p class="text-gray-600">${date}</p>
            </header>
            <div class="bg-white rounded-xl shadow-md p-8 md:p-12">
                <p class="text-xl mb-6">Expert ${title,,} service at ARM Auto Repair. Serving ${city} and the entire Coastal Bend region.</p>
                <h2 class="text-3xl font-bold mb-4 mt-8">Professional Service in ${city}</h2>
                <p class="mb-4">At ARM Auto Repair, our ASE certified mechanics provide expert automotive repair for ${city} drivers. Located in nearby Robstown, we're your trusted choice for quality service.</p>
                <div class="bg-arm-blue text-white p-6 rounded-lg my-8">
                    <h3 class="text-2xl font-bold mb-3">Need Service?</h3>
                    <p class="mb-4">Call us today: <a href="tel:3612201629" class="text-white underline font-bold">(361) 220-1629</a></p>
                    <p>601 E Main St, Robstown TX | Serving the Coastal Bend</p>
                </div>
                <h2 class="text-3xl font-bold mb-4 mt-8">Why Choose ARM Auto Repair</h2>
                <ul class="list-disc pl-6 mb-6">
                    <li>ASE Certified Mechanics</li>
                    <li>Gas and Diesel Expertise</li>
                    <li>Quality Parts and Service</li>
                    <li>Fair, Transparent Pricing</li>
                    <li>Serving ${city} and Surrounding Areas</li>
                </ul>
                <p class="mt-6"><a href="../services.html" class="bg-arm-red text-white px-6 py-3 rounded-lg inline-block hover:bg-red-700">View All Services</a></p>
            </div>
        </article>
    </main>
    <footer class="bg-arm-navy text-white py-12">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <p>&copy; 2025 ARM Auto Repair. ASE Certified. Serving the Coastal Bend.</p>
        </div>
    </footer>
</body>
</html>
EOFPOST

  # Use envsubst to replace variables
  title="$title" city="$city" date="$date" keywords="$keywords" envsubst < "$filename" > "${filename}.tmp" && mv "${filename}.tmp" "$filename"
  echo "✓ Created $filename"
done

echo ""
echo "Created 19 additional SEO-optimized blog posts!"
