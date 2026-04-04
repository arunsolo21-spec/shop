buildscript {
    repositories {
        google()
        mavenCentral()
    }
    dependencies {
        // ✅ Google Services Plugin - REQUIRED for Firebase
        classpath("com.google.gms:google-services:4.4.0")
        
        // Keep existing dependencies...
        classpath("com.android.tools.build:gradle:8.7.0")
        classpath("org.jetbrains.kotlin:kotlin-gradle-plugin:1.9.24")
    }
}

allprojects {
    repositories {
        google()
        mavenCentral()
    }
}

val clean by tasks.registering(Delete::class) {
    delete(rootProject.buildDir)
}