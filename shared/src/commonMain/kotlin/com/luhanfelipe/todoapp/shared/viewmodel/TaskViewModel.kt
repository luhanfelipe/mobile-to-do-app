package com.luhanfelipe.todoapp.shared.viewmodel

import com.luhanfelipe.todoapp.shared.model.Task
import com.luhanfelipe.todoapp.shared.repository.TaskRepository
import com.luhanfelipe.todoapp.shared.repository.TaskStatusFilter
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.cancel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch

class TaskViewModel(
    private val taskRepository: TaskRepository
) {
    private val scope: CoroutineScope = CoroutineScope(SupervisorJob() + Dispatchers.Default)

    private val _statusFilter = MutableStateFlow(TaskStatusFilter.ALL)
    val statusFilter: StateFlow<TaskStatusFilter> = _statusFilter

    private val _categoryFilter = MutableStateFlow<Long?>(null)
    val categoryFilter: StateFlow<Long?> = _categoryFilter

    val tasks: StateFlow<List<Task>> = combine(
        taskRepository.observeAll(),
        _statusFilter,
        _categoryFilter
    ) { allTasks, status, categoryId ->
        allTasks.filter { task ->
            val statusMatch = when (status) {
                TaskStatusFilter.ALL -> true
                TaskStatusFilter.PENDING -> !task.completed
                TaskStatusFilter.COMPLETED -> task.completed
            }
            val categoryMatch = categoryId == null || task.categoryId == categoryId
            statusMatch && categoryMatch
        }
    }.stateIn(
        scope = scope,
        started = SharingStarted.WhileSubscribed(5_000),
        initialValue = emptyList()
    )

    fun setStatusFilter(filter: TaskStatusFilter) {
        _statusFilter.value = filter
    }

    fun setCategoryFilter(categoryId: Long?) {
        _categoryFilter.value = categoryId
    }

    fun addTask(
        title: String,
        description: String?,
        dueDateTime: String?,
        categoryId: Long?
    ): Job = scope.launch {
        taskRepository.insert(
            Task(
                id = 0,
                title = title,
                description = description,
                completed = false,
                dueDateTime = dueDateTime,
                createdAt = nowIsoString(),
                categoryId = categoryId
            )
        )
    }

    fun editTask(task: Task): Job = scope.launch {
        taskRepository.update(task)
    }

    fun deleteTask(id: Long): Job = scope.launch {
        taskRepository.delete(id)
    }

    fun toggleCompleted(task: Task): Job = scope.launch {
        taskRepository.update(task.copy(completed = !task.completed))
    }

    fun clear() {
        scope.cancel()
    }

    private fun nowIsoString(): String = kotlinx.datetime.Clock.System.now().toString()
}
