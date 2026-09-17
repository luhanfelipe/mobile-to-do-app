package com.luhanfelipe.todoapp.shared.repository

import app.cash.sqldelight.coroutines.asFlow
import app.cash.sqldelight.coroutines.mapToList
import com.luhanfelipe.todoapp.db.CategoryQueries
import com.luhanfelipe.todoapp.shared.model.Category
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.withContext

class CategoryRepository(
    private val queries: CategoryQueries
) {
    fun observeAll(): Flow<List<Category>> =
        queries.selectAllCategories().asFlow().mapToList(Dispatchers.Default).map { list ->
            list.map { it.toDomain() }
        }

    suspend fun getById(id: Long): Category? = withContext(Dispatchers.Default) {
        queries.selectCategoryById(id).executeAsOneOrNull()?.toDomain()
    }

    suspend fun insert(name: String) = withContext(Dispatchers.Default) {
        queries.insertCategory(name)
    }

    suspend fun update(id: Long, name: String) = withContext(Dispatchers.Default) {
        queries.updateCategory(name, id)
    }

    suspend fun delete(id: Long) = withContext(Dispatchers.Default) {
        queries.deleteCategory(id)
    }

    private fun com.luhanfelipe.todoapp.db.Category.toDomain(): Category = Category(
        id = id,
        name = name
    )
}
