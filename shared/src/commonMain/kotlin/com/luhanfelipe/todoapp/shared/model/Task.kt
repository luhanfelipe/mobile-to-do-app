package com.luhanfelipe.todoapp.shared.model

data class Task(
    val id: Long,
    val title: String,
    val description: String?,
    val completed: Boolean,
    val dueDateTime: String?,
    val createdAt: String,
    val categoryId: Long?
)
