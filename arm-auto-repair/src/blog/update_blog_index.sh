#!/bin/bash

# Generate blog index with all 30 posts

cat > index.html << 'EOFINDEX'
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Auto Repair Blog | ARM Auto Repair | Corpus Christi & Robstown TX</title>
    <meta name="description" content="Expert auto repair advice for Corpus Christi and Coastal Bend drivers. 30+ guides on maintenance, repairs, and car care from ASE certified mechanics.">
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
                    <a href="index.html" class="text-arm-red font-medium">Blog</a>
                    <a href="../index.html#contact" class="text-gray-700 hover:text-arm-red font-medium">Contact</a>
                    <a href="tel:3612201629" class="bg-arm-red text-white px-6 py-2 rounded-lg hover:bg-red-700 transition font-semibold">(361) 220-1629</a>
                </nav>
            </div>
        </div>
    </header>

    <section class="bg-gradient-to-br from-arm-blue to-arm-navy text-white py-16">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 class="text-5xl font-bold mb-4">Auto Repair Blog</h1>
            <p class="text-xl text-gray-200">30+ Expert Guides | Serving the Entire Coastal Bend</p>
        </div>
    </section>

    <main class="py-16 bg-gray-50">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                
EOFINDEX

# Add all posts
for file in brake-job-corpus-christi.html \
oil-change-robstown.html \
transmission-repair-coastal-bend.html \
check-engine-light-diagnosis.html \
ac-repair-corpus-christi-summer.html \
diesel-truck-repair-robstown.html \
tire-rotation-importance.html \
battery-replacement-south-texas.html \
wheel-alignment-signs.html \
car-wont-start-corpus-christi.html \
engine-overheating-portland-tx.html \
starter-problems-kingsville-tx.html \
serpentine-belt-replacement-ingleside.html \
catalytic-converter-repair-aransas-pass.html \
power-steering-problems-rockport.html \
fuel-injector-cleaning-beeville.html \
cabin-air-filter-replacement-alice.html \
abs-brake-problems-sinton.html \
coolant-leak-diagnosis-odem.html \
spark-plug-replacement-taft.html \
oxygen-sensor-replacement-gregory.html \
cv-joint-repair-fulton.html \
exhaust-manifold-leak-driscoll.html \
cruise-control-repair-bishop.html \
window-regulator-repair-mathis.html \
heater-core-replacement-san-patricio.html \
ignition-coil-replacement-refugio.html \
blend-door-actuator-bayside.html \
mass-airflow-sensor-cleaning-woodsboro.html \
egr-valve-replacement-skidmore.html; do
  
  # Extract title from file
  title=$(grep '<h1' "$file" | sed 's/.*<h1[^>]*>\(.*\)<\/h1>.*/\1/' | head -1)
  
  # Create card
  cat >> index.html << EOFCARD
                <article class="bg-white rounded-xl shadow-md hover:shadow-xl transition overflow-hidden">
                    <div class="p-6">
                        <h2 class="text-2xl font-bold mb-3 text-arm-navy hover:text-arm-red transition"><a href="$file">$title</a></h2>
                        <p class="text-gray-600">Expert service in the Coastal Bend</p>
                    </div>
                </article>

EOFCARD
done

# Close the HTML
cat >> index.html << 'EOFCLOSE'
            </div>
        </div>
    </main>

    <footer class="bg-arm-navy text-white py-12">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <p>&copy; 2025 ARM Auto Repair. ASE Certified. Serving Corpus Christi and the Coastal Bend.</p>
        </div>
    </footer>
</body>
</html>
EOFCLOSE

echo "✓ Blog index updated with all 30 posts"
