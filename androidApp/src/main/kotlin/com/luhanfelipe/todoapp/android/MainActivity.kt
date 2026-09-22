package com.luhanfelipe.todoapp.android

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import app.cash.sqldelight.driver.android.AndroidSqliteDriver
import com.luhanfelipe.todoapp.db.TodoDatabase
import com.luhanfelipe.todoapp.shared.DatabaseFactory
import com.luhanfelipe.todoapp.shared.ui.TodoApp

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        val database = DatabaseFactory.create(
            AndroidSqliteDriver(TodoDatabase.Schema, this, "todo.db")
        )
        setContent {
            TodoApp(database)
        }
    }
}
