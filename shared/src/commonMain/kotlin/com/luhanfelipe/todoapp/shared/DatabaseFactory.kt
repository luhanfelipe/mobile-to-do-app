package com.luhanfelipe.todoapp.shared

import app.cash.sqldelight.db.SqlDriver
import com.luhanfelipe.todoapp.db.TodoDatabase

object DatabaseFactory {
    fun create(driver: SqlDriver): TodoDatabase = TodoDatabase(driver)
}
