plugins {
    id("org.jetbrains.kotlin.jvm")
    id("org.jetbrains.compose")
}

kotlin {
    jvmToolchain(17)
}

dependencies {
    implementation(project(":shared"))
    implementation(compose.desktop.currentOs)
    implementation("app.cash.sqldelight:sqlite-driver:2.0.2")
}

compose.desktop {
    application {
        mainClass = "com.luhanfelipe.todoapp.desktop.MainKt"
    }
}
