package com.luhanfelipe.todoapp.shared.di

import com.luhanfelipe.todoapp.db.TodoDatabase
import com.luhanfelipe.todoapp.shared.repository.CategoryRepository
import com.luhanfelipe.todoapp.shared.repository.TaskRepository
import com.luhanfelipe.todoapp.shared.viewmodel.CategoryViewModel
import com.luhanfelipe.todoapp.shared.viewmodel.TaskViewModel
import org.koin.core.module.Module
import org.koin.dsl.module

fun sharedModule(database: TodoDatabase): Module = module {
    single { database }
    single { TaskRepository(get<TodoDatabase>().taskQueries) }
    single { CategoryRepository(get<TodoDatabase>().categoryQueries) }
    factory { TaskViewModel(get()) }
    factory { CategoryViewModel(get()) }
}
