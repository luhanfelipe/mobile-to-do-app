package com.luhanfelipe.todoapp.desktop

import androidx.compose.material3.Text
import androidx.compose.ui.window.Window
import androidx.compose.ui.window.application

fun main() = application {
    Window(onCloseRequest = ::exitApplication, title = "To-Do App") {
        Text("To-Do App")
    }
}
