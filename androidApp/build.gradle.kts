plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android") version "2.1.20"
    id("org.jetbrains.compose")
}

android {
    namespace = "com.luhanfelipe.todoapp.android"
    compileSdk = 35

    defaultConfig {
        applicationId = "com.luhanfelipe.todoapp.android"
        minSdk = 24
        targetSdk = 35
        versionCode = 1
        versionName = "1.0"
    }

    buildFeatures {
        compose = true
    }

    composeOptions {
        kotlinCompilerExtensionVersion = "1.5.15"
    }
}

dependencies {
    implementation(project(":shared"))
    implementation("androidx.activity:activity-compose:1.10.1")
    implementation("androidx.core:core-ktx:1.15.0")
    implementation("org.jetbrains.compose.material3:material3:1.8.2")
}
