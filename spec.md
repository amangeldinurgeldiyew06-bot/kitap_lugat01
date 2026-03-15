# Kitap

## Overview
Kitap is a multilingual word memorization tool that helps users build vocabulary through dictionary management and quiz-based learning. The app supports Turkmen and English interface languages with bilingual Turkmen-English content.

## Core Features

### Language Support
- Interface available in Turkmen and English
- Users can switch between languages at any time using the language switcher
- App content is bilingual Turkmen-English

### Dictionary Management
- Users can create multiple dictionaries for any source and target language pairs
- Each dictionary contains word pairs with source word and translation
- Users can add, edit, and delete word pairs within dictionaries
- Users can view all words in a dictionary
- Users can mark/unmark word pairs as favorites using a star icon toggle
- Bulk import functionality allows users to paste or upload text containing word pairs in format "Word-Translation" (e.g., "Man-Adam") which automatically parses and adds all pairs to the selected dictionary

### Smart Learning System
- Each dictionary has three associated collections:
  - **General**: Contains all words from the dictionary
  - **Unknown**: Contains words the user has answered incorrectly
  - **Favorites**: Contains words the user has marked as favorites
- When a user answers incorrectly in a quiz, the word moves to the Unknown collection
- When a user answers correctly for a word in the Unknown collection, it gets removed from Unknown
- Words remain in the base dictionary regardless of their Unknown or Favorites status
- Users can favorite/unfavorite words independently of their Unknown status

### Quiz System
- Multiple-choice quiz format with 4 options (a, b, c, d)
- One correct answer and three random incorrect answers from the same dictionary
- Quiz presents all words systematically with multiple-choice answers drawn from word translations
- General collection quiz cycles through every word in the dictionary
- Unknown collection quiz cycles through all unknown words until they are answered correctly and removed
- Favorites collection quiz cycles through all favorited words
- Quiz tracks correct/incorrect answers to update Unknown collection
- Repeated correct answers remove words from the Unknown set

### User Interface
- Dashboard showing all created dictionaries
- Dictionary detail view for managing word pairs with tabs for General, Unknown, and Favorites collections
- Star icon toggle for favoriting/unfavoriting words in dictionary views
- Quiz interface with multiple-choice questions for all three collections
- Language switcher supporting Turkmen and English
- Bulk import interface for adding multiple word pairs at once
- Application displays "Kitap" as the logo text in the header across all languages using the new transparent logo design
- All branding elements including favicon, loading screens, HTML title, metadata, and UI components consistently use "Kitap" only with the updated logo asset
- Header and layout components use the new clean Kitap logo from `generated/kitap-logo-new-transparent.dim_200x200.png`
- Logo works consistently across both light and dark themes with transparent background
- All references to "Öwren" have been completely removed from the interface and replaced with "Kitap" branding
- Favicon uses the new Kitap logo design
- Loading screens and all visual elements display only "Kitap" with the updated logo

## Backend Data Storage
- User dictionaries with metadata (name, source language, target language)
- Word pairs for each dictionary (source word, translation)
- Unknown word tracking per dictionary
- Favorites word tracking per dictionary
- User progress and statistics for persistent data between sessions

## Backend Operations
- Create, read, update, delete dictionaries
- Add, edit, remove word pairs from dictionaries
- Bulk import word pairs from text input
- Track and manage unknown words per dictionary
- Track and manage favorite words per dictionary
- Toggle favorite status for individual word pairs
- Retrieve quiz questions with systematic iteration through word sets for all three collections
- Update unknown word status based on quiz results
- Support for complete quiz cycles through all words in General, Unknown, and Favorites collections
- Maintain persistent progress data across sessions
