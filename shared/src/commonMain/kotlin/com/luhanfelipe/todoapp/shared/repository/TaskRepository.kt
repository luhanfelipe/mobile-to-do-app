package com.luhanfelipe.todoapp.shared.repository

import app.cash.sqldelight.coroutines.asFlow
import app.cash.sqldelight.coroutines.mapToList
import com.luhanfelipe.todoapp.db.TaskQueries
import com.luhanfelipe.todoapp.shared.model.Task
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.withContext

enum class TaskStatusFilter {
    ALL,
    PENDING,
    COMPLETED
}

class TaskRepository(
    private val queries: TaskQueries
) {
    fun observeAll(): Flow<List<Task>> =
        queries.selectAllTasks().asFlow().mapToList(Dispatchers.Default).map { list ->
            list.map { it.toDomain() }
        }

    fun observeByStatus(completed: Boolean): Flow<List<Task>> =
        queries.selectTasksByStatus(completed).asFlow().mapToList(Dispatchers.Default).map { list ->
            list.map { it.toDomain() }
        }

    fun observeByCategory(categoryId: Long): Flow<List<Task>> =
        queries.selectTasksByCategory(categoryId).asFlow().mapToList(Dispatchers.Default).map { list ->
            list.map { it.toDomain() }
        }

    suspend fun getById(id: Long): Task? = withContext(Dispatchers.Default) {
        queries.selectTaskById(id).executeAsOneOrNull()?.toDomain()
    }

    suspend fun insert(task: Task) = withContext(Dispatchers.Default) {
        queries.insertTask(
            title = task.title,
            description = task.description,
            completed = task.completed,
            dueDateTime = task.dueDateTime,
            createdAt = task.createdAt,
            categoryId = task.categoryId
        )
    }

    suspend fun update(task: Task) = withContext(Dispatchers.Default) {
        queries.updateTask(
            title = task.title,
            description = task.description,
            completed = task.completed,
            dueDateTime = task.dueDateTime,
            createdAt = task.createdAt,
            categoryId = task.categoryId,
            id = task.id
        )
    }

    suspend fun delete(id: Long) = withContext(Dispatchers.Default) {
        queries.deleteTask(id)
    }

    private fun com.luhanfelipe.todoapp.db.Task.toDomain(): Task = Task(
        id = id,
        title = title,
        description = description,
        completed = completed,
        dueDateTime = dueDateTime,
        createdAt = createdAt,
        categoryId = categoryId
    )
}
