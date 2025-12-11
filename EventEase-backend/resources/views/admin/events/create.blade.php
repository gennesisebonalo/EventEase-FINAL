<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Add New Event - EventEase</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f5f6fa;
            margin: 0;
            color: #333;
        }
        .container {
            max-width: 700px;
            margin: auto;
            padding: 30px;
        }
        .card {
            background: white;
            padding: 25px;
            border-radius: 12px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.05);
        }
        h1 {
            font-size: 1.6rem;
            margin-bottom: 20px;
        }
        label {
            display: block;
            margin-top: 15px;
            font-weight: bold;
            font-size: 0.95rem;
        }
        input, textarea, select {
            width: 100%;
            padding: 10px 12px;
            margin-top: 6px;
            border: 1px solid #ddd;
            border-radius: 8px;
            font-size: 0.9rem;
            resize: none;
        }
        textarea {
            height: 100px;
        }
        .form-row {
            display: flex;
            gap: 10px;
        }
        .form-row div {
            flex: 1;
        }
        .btn {
            display: inline-block;
            margin-top: 20px;
            background-color: #004080;
            color: white;
            padding: 10px 16px;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-size: 0.95rem;
        }
        .btn:hover {
            background-color: #003366;
        }
        .btn-cancel {
            background-color: #ccc;
            color: #333;
            margin-left: 10px;
            text-decoration: none;
            padding: 10px 16px;
            border-radius: 8px;
            font-size: 0.95rem;
        }
        .error {
            color: red;
            font-size: 0.9rem;
            margin-top: 4px;
        }
        .hidden { display:none; }
    </style>
</head>
<body>

<div class="container">
    <div class="card">
        <h1>Add New Event</h1>

        <!-- Show validation errors -->
        @if ($errors->any())
            <div class="error">
                <ul>
                    @foreach ($errors->all() as $error)
                        <li>• {{ $error }}</li>
                    @endforeach
                </ul>
            </div>
        @endif

        <form action="{{ route('events.store') }}" method="POST">
            @csrf

            <label for="title">Event Name</label>
            <input type="text" id="title" name="title" value="{{ old('title') }}" required />

            <div class="form-row">
                <div>
                    <label for="start_time">Start Date & Time</label>
                    <input type="datetime-local" id="start_time" name="start_time" value="{{ old('start_time') }}" required />
                </div>
                <div>
                    <label for="end_time">End Date & Time</label>
                    <input type="datetime-local" id="end_time" name="end_time" value="{{ old('end_time') }}" required />
                </div>
            </div>

            <label for="venue_id">Venue</label>
            <select id="venue_id" name="venue_id" required>
                <option value="">Select Venue</option>
                @foreach($venues as $venue)
                    <option value="{{ $venue->id }}" {{ old('venue_id') == $venue->id ? 'selected' : '' }}>
                        {{ $venue->name }}
                    </option>
                @endforeach
            </select>

            <label for="category_id">Category</label>
            <select id="category_id" name="category_id" required>
                <option value="">Select Category</option>
                @foreach($categories as $category)
                    <option value="{{ $category->id }}" {{ old('category_id') == $category->id ? 'selected' : '' }}>
                        {{ $category->name }}
                    </option>
                @endforeach
            </select>

            <label for="location">Location</label>
            <input type="text" id="location" name="location" value="{{ old('location') }}" required />

            <label for="status">Status</label>
            <select id="status" name="status" required>
                <option value="upcoming" {{ old('status', 'upcoming') == 'upcoming' ? 'selected' : '' }}>Upcoming</option>
                <option value="ongoing" {{ old('status') == 'ongoing' ? 'selected' : '' }}>Ongoing</option>
                <option value="completed" {{ old('status') == 'completed' ? 'selected' : '' }}>Completed</option>
                <option value="cancelled" {{ old('status') == 'cancelled' ? 'selected' : '' }}>Cancelled</option>
            </select>

            <label for="description">Description</label>
            <textarea id="description" name="description">{{ old('description') }}</textarea>

            

            <label for="target_audience">Target Audience</label>
            <select id="target_audience" name="target_audience" required>
                <option value="">Select Target Audience</option>
                @foreach($audienceLevels as $key => $label)
                    <option value="{{ $key }}" {{ old('target_audience') == $key ? 'selected' : '' }}>{{ $label }}</option>
                @endforeach
            </select>

            <div id="course_wrapper" class="hidden">
                <label for="course">Select Course</label>
                <select id="course" name="course">
                    <option value="">Select Course</option>
                    @foreach($collegeCourses as $key => $label)
                        <option value="{{ $key }}" {{ old('course') == $key ? 'selected' : '' }}>{{ $label }}</option>
                    @endforeach
                </select>
            </div>

            <button type="submit" class="btn">Save Event</button>
            <a href="{{ route('events.index') }}" class="btn-cancel">Cancel</a>
        </form>
    </div>
</div>

<script>
    (function() {
        const audience = document.getElementById('target_audience');
        const courseWrap = document.getElementById('course_wrapper');
        const course = document.getElementById('course');

        function toggleCourse() {
            if (audience.value === 'college') {
                courseWrap.classList.remove('hidden');
            } else {
                courseWrap.classList.add('hidden');
                course.value = '';
            }
        }

        audience.addEventListener('change', toggleCourse);
        // initialize on load using old() state
        toggleCourse();
    })();
</script>
</body>
</html>
