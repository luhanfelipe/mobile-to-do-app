package com.luhanfelipe.todoapp.desktop

import app.cash.sqldelight.driver.jdbc.sqlite.JdbcSqliteDriver
import androidx.compose.ui.window.Window
import androidx.compose.ui.window.application
import com.luhanfelipe.todoapp.db.TodoDatabase
import com.luhanfelipe.todoapp.shared.DatabaseFactory
import com.luhanfelipe.todoapp.shared.ui.TodoApp

fun main() = application {
    val driver = JdbcSqliteDriver("jdbc:sqlite:todo.db")
    runCatching { TodoDatabase.Schema.create(driver) }
    val database = DatabaseFactory.create(driver)

    Window(onCloseRequest = ::exitApplication, title = "To-Do App") {
        TodoApp(database)
    }
}
