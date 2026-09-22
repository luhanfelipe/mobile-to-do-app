package com.luhanfelipe.todoapp.shared.ui

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.Edit
import androidx.compose.material.icons.filled.RadioButtonUnchecked
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.AssistChip
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.FloatingActionButton
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.material3.TopAppBar
import androidx.compose.runtime.Composable
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextDecoration
import androidx.compose.ui.unit.dp
import com.luhanfelipe.todoapp.db.TodoDatabase
import com.luhanfelipe.todoapp.shared.di.sharedModule
import com.luhanfelipe.todoapp.shared.model.Task
import com.luhanfelipe.todoapp.shared.repository.TaskStatusFilter
import com.luhanfelipe.todoapp.shared.viewmodel.TaskViewModel
import org.koin.compose.koinInject
import org.koin.core.context.startKoin
import org.koin.core.context.stopKoin

@Composable
fun TodoApp(database: TodoDatabase) {
    DisposableEffect(database) {
        startKoin {
            modules(sharedModule(database))
        }
        onDispose { stopKoin() }
    }

    TodoTheme {
        val taskViewModel: TaskViewModel = koinInject()
        TodoScreen(taskViewModel)
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun TodoScreen(taskViewModel: TaskViewModel) {
    val tasks by taskViewModel.tasks.collectAsState()
    val selectedFilter by taskViewModel.statusFilter.collectAsState()
    var editorState by remember { mutableStateOf(TaskEditorState()) }

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Text(
                        text = "My Tasks",
                        style = MaterialTheme.typography.headlineSmall,
                        fontWeight = FontWeight.SemiBold
                    )
                }
            )
        },
        floatingActionButton = {
            FloatingActionButton(onClick = { editorState = TaskEditorState(showDialog = true) }) {
                Icon(Icons.Default.Add, contentDescription = "Add task")
            }
        }
    ) { paddingValues ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
                .padding(horizontal = 16.dp, vertical = 12.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            FilterRow(selectedFilter) { taskViewModel.setStatusFilter(it) }
            HorizontalDivider()

            if (tasks.isEmpty()) {
                Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                    Text(
                        text = "No tasks yet. Tap + to add one.",
                        style = MaterialTheme.typography.bodyLarge,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
            } else {
                LazyColumn(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                    items(tasks, key = { it.id }) { task ->
                        TaskCard(
                            task = task,
                            onToggle = { taskViewModel.toggleCompleted(task) },
                            onEdit = {
                                editorState = TaskEditorState(
                                    showDialog = true,
                                    editingTask = task,
                                    title = task.title,
                                    description = task.description.orEmpty()
                                )
                            },
                            onDelete = { taskViewModel.deleteTask(task.id) }
                        )
                    }
                }
            }
        }
    }

    if (editorState.showDialog) {
        TaskEditorDialog(
            state = editorState,
            onDismiss = { editorState = TaskEditorState() },
            onChange = { editorState = it },
            onSave = { title, description, editingTask ->
                if (title.isBlank()) {
                    return@TaskEditorDialog
                }

                if (editingTask == null) {
                    taskViewModel.addTask(
                        title = title.trim(),
                        description = description.trim().takeIf { it.isNotEmpty() },
                        dueDateTime = null,
                        categoryId = null
                    )
                } else {
                    taskViewModel.editTask(
                        editingTask.copy(
                            title = title.trim(),
                            description = description.trim().takeIf { it.isNotEmpty() }
                        )
                    )
                }
                editorState = TaskEditorState()
            }
        )
    }
}

@Composable
private fun FilterRow(
    selected: TaskStatusFilter,
    onSelect: (TaskStatusFilter) -> Unit
) {
    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
        TaskStatusFilter.entries.forEach { filter ->
            AssistChip(
                onClick = { onSelect(filter) },
                label = { Text(filter.name.lowercase().replaceFirstChar { it.uppercase() }) },
                leadingIcon = {
                    if (selected == filter) {
                        Icon(Icons.Default.CheckCircle, contentDescription = null, modifier = Modifier.size(18.dp))
                    }
                }
            )
        }
    }
}

@Composable
private fun TaskCard(
    task: Task,
    onToggle: () -> Unit,
    onEdit: () -> Unit,
    onDelete: () -> Unit
) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(20.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
        elevation = CardDefaults.cardElevation(defaultElevation = 6.dp)
    ) {
        Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Row(
                    modifier = Modifier.weight(1f),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    IconButton(onClick = onToggle) {
                        Icon(
                            imageVector = if (task.completed) Icons.Default.CheckCircle else Icons.Default.RadioButtonUnchecked,
                            contentDescription = if (task.completed) "Mark as pending" else "Mark as complete",
                            tint = if (task.completed) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                    Text(
                        text = task.title,
                        style = MaterialTheme.typography.titleMedium,
                        textDecoration = if (task.completed) TextDecoration.LineThrough else TextDecoration.None
                    )
                }
                Row {
                    IconButton(onClick = onEdit) {
                        Icon(Icons.Default.Edit, contentDescription = "Edit task")
                    }
                    IconButton(onClick = onDelete) {
                        Icon(Icons.Default.Delete, contentDescription = "Delete task")
                    }
                }
            }

            task.description?.takeIf { it.isNotBlank() }?.let {
                Text(
                    text = it,
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
        }
    }
}

@Composable
private fun TaskEditorDialog(
    state: TaskEditorState,
    onDismiss: () -> Unit,
    onChange: (TaskEditorState) -> Unit,
    onSave: (title: String, description: String, editingTask: Task?) -> Unit
) {
    AlertDialog(
        onDismissRequest = onDismiss,
        title = {
            Text(
                text = if (state.editingTask == null) "Add task" else "Edit task",
                style = MaterialTheme.typography.titleLarge
            )
        },
        text = {
            Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                OutlinedTextField(
                    value = state.title,
                    onValueChange = { onChange(state.copy(title = it)) },
                    label = { Text("Title") },
                    modifier = Modifier.fillMaxWidth()
                )
                OutlinedTextField(
                    value = state.description,
                    onValueChange = { onChange(state.copy(description = it)) },
                    label = { Text("Description") },
                    modifier = Modifier.fillMaxWidth(),
                    minLines = 3
                )
            }
        },
        confirmButton = {
            TextButton(onClick = { onSave(state.title, state.description, state.editingTask) }) {
                Text(if (state.editingTask == null) "Add" else "Save")
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) {
                Text("Cancel")
            }
        }
    )
}

private data class TaskEditorState(
    val showDialog: Boolean = false,
    val editingTask: Task? = null,
    val title: String = "",
    val description: String = ""
)
