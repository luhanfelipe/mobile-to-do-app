package com.luhanfelipe.todoapp.shared.viewmodel

import com.luhanfelipe.todoapp.shared.model.Category
import com.luhanfelipe.todoapp.shared.repository.CategoryRepository
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.cancel
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch

class CategoryViewModel(
    private val categoryRepository: CategoryRepository
) {
    private val scope: CoroutineScope = CoroutineScope(SupervisorJob() + Dispatchers.Default)

    val categories: StateFlow<List<Category>> = categoryRepository.observeAll().stateIn(
        scope = scope,
        started = SharingStarted.WhileSubscribed(5_000),
        initialValue = emptyList()
    )

    fun addCategory(name: String): Job = scope.launch {
        categoryRepository.insert(name.trim())
    }

    fun renameCategory(id: Long, newName: String): Job = scope.launch {
        categoryRepository.update(id, newName.trim())
    }

    fun deleteCategory(id: Long): Job = scope.launch {
        categoryRepository.delete(id)
    }

    fun clear() {
        scope.cancel()
    }
}
