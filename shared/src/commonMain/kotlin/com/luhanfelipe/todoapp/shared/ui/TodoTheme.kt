package com.luhanfelipe.todoapp.shared.ui

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

private val LightColors = lightColorScheme(
    primary = Color(0xFF5E35B1),
    onPrimary = Color.White,
    secondary = Color(0xFF00897B),
    onSecondary = Color.White,
    background = Color(0xFFF7F5FF),
    onBackground = Color(0xFF1D1B20),
    surface = Color.White,
    onSurface = Color(0xFF1D1B20)
)

private val DarkColors = darkColorScheme(
    primary = Color(0xFFD0BCFF),
    onPrimary = Color(0xFF381E72),
    secondary = Color(0xFF80CBC4),
    onSecondary = Color(0xFF003731),
    background = Color(0xFF141218),
    onBackground = Color(0xFFE6E0E9),
    surface = Color(0xFF211F26),
    onSurface = Color(0xFFE6E0E9)
)

@Composable
fun TodoTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    content: @Composable () -> Unit
) {
    MaterialTheme(
        colorScheme = if (darkTheme) DarkColors else LightColors,
        typography = MaterialTheme.typography,
        content = content
    )
}
