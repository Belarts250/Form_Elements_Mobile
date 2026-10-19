
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  Switch,
  Button,
  ScrollView,
  Image,
  Alert,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import Slider from '@react-native-community/slider';
import { Calendar } from 'react-native-calendars';
import * as DocumentPicker from 'expo-document-picker';

export default function App() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [age, setAge] = useState('');
  const [message, setMessage] = useState('');
  const [country, setCountry] = useState('');
  const [gender, setGender] = useState('');
  const [hobbies, setHobbies] = useState([]);
  const [notifications, setNotifications] = useState(false);
  const [rating, setRating] = useState(5);
  const [date, setDate] = useState('');
  const [showCalendar, setShowCalendar] = useState(false);
  const [time, setTime] = useState('');
  const [file, setFile] = useState(null);
  const [errors, setErrors] = useState({});
  const [cameraStream, setCameraStream] = useState(null);
  const [cameraError, setCameraError] = useState('');
  const [showCamera, setShowCamera] = useState(false);
  const [photoData, setPhotoData] = useState(null);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    if (videoRef.current && cameraStream) {
      videoRef.current.srcObject = cameraStream;
      videoRef.current.play().catch(() => {});
    }
  }, [cameraStream, showCamera]);

  useEffect(() => {
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [cameraStream]);

  const toggleHobby = (hobby) => {
    setHobbies((current) =>
      current.includes(hobby)
        ? current.filter((item) => item !== hobby)
        : [...current, hobby]
    );
  };

  const openCamera = async () => {
    try {
      setCameraError('');

      if (!navigator.mediaDevices?.getUserMedia) {
        setCameraError(
          'Camera access is unavailable. Open the app on localhost or HTTPS in a supported browser.'
        );
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false,
      });

      if (cameraStream) {
        cameraStream.getTracks().forEach((track) => track.stop());
      }

      setCameraStream(stream);
      setShowCamera(true);
    } catch (error) {
      setCameraError(
        error.name === 'NotAllowedError'
          ? 'Camera permission was denied. Allow camera access in your browser settings.'
          : 'Unable to open the PC camera. Check that it is connected and not being used by another app.'
      );
    }
  };

  const closeCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
    }

    setCameraStream(null);
    setShowCamera(false);
  };

  const takePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video || !canvas || !video.videoWidth) {
      setCameraError('The camera is not ready yet.');
      return;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const context = canvas.getContext('2d');
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    const image = canvas.toDataURL('image/png');
    setPhotoData(image);
    closeCamera();
  };

  const selectFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
      });

      if (!result.canceled) {
        setFile(result.assets[0]);
      }
    } catch {
      Alert.alert('Error', 'Unable to select the file.');
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!name.trim()) {
      newErrors.name = 'Full name is required.';
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      newErrors.email = 'Enter a valid email address.';
    }

    if (password.length < 8) {
      newErrors.password = 'Password must contain at least 8 characters.';
    }

    if (!/^07\d{8}$/.test(phone)) {
      newErrors.phone = 'Enter exactly 10 digits starting with 07.';
    }

    const ageNumber = Number(age);

    if (
      !age.trim() ||
      !Number.isInteger(ageNumber) ||
      ageNumber < 1 ||
      ageNumber > 120
    ) {
      newErrors.age = 'Enter an age between 1 and 120.';
    }

    if (!country) {
      newErrors.country = 'Please select a country.';
    }

    if (!gender) {
      newErrors.gender = 'Please select a gender.';
    }

    if (!date) {
      newErrors.date = 'Please choose a date.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) {
      Alert.alert(
        'Invalid Form',
        'Please correct the fields with errors before submitting.'
      );
      return;
    }

    const formData = {
      name: name.trim(),
      email: email.trim(),
      phone,
      age: Number(age),
      message,
      country,
      gender,
      hobbies,
      notifications,
      rating,
      date,
      time,
      file: file
        ? {
            name: file.name,
            uri: file.uri,
            size: file.size,
            mimeType: file.mimeType,
          }
        : null,
      photo: photoData,
    };

    console.log('Form Data:', formData);
    Alert.alert('Success', 'Form submitted successfully.');
  };

  const field = {
    marginBottom: 24,
  };

  const title = {
    fontWeight: 'bold',
    marginBottom: 8,
  };

  const input = {
    borderWidth: 1,
    borderColor: '#999',
    padding: 10,
  };

  const errorText = {
    color: 'red',
    marginTop: 6,
  };

  const today = new Date().toLocaleDateString('en-CA');

  return (
    <ScrollView contentContainerStyle={{ padding: 20 }}>
      <Text style={{ fontWeight: 'bold', fontSize: 22, marginBottom: 24 }}>
        Registration Form
      </Text>

      <View style={field}>
        <Text style={title}>Full Name *</Text>
        <TextInput
          style={input}
          placeholder="Enter your full name"
          value={name}
          onChangeText={setName}
        />
        {!!errors.name && <Text style={errorText}>{errors.name}</Text>}
      </View>

      <View style={field}>
        <Text style={title}>Email *</Text>
        <TextInput
          style={input}
          placeholder="Enter your email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        {!!errors.email && <Text style={errorText}>{errors.email}</Text>}
      </View>

      <View style={field}>
        <Text style={title}>Password *</Text>
        <TextInput
          style={input}
          placeholder="At least 8 characters"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        {!!errors.password && (
          <Text style={errorText}>{errors.password}</Text>
        )}
      </View>

      <View style={field}>
        <Text style={title}>Phone Number *</Text>
        <TextInput
          style={input}
          placeholder="07XXXXXXXX"
          value={phone}
          onChangeText={(value) =>
            setPhone(value.replace(/\D/g, '').slice(0, 10))
          }
          keyboardType="number-pad"
          maxLength={10}
        />
        {!!errors.phone && <Text style={errorText}>{errors.phone}</Text>}
      </View>

      <View style={field}>
        <Text style={title}>Age *</Text>
        <TextInput
          style={input}
          placeholder="Enter your age"
          value={age}
          onChangeText={setAge}
          keyboardType="numeric"
        />
        {!!errors.age && <Text style={errorText}>{errors.age}</Text>}
      </View>

      <View style={field}>
        <Text style={title}>Message</Text>
        <TextInput
          style={[input, { minHeight: 80, textAlignVertical: 'top' }]}
          placeholder="Write your message"
          value={message}
          onChangeText={setMessage}
          multiline
        />
      </View>

      <View style={field}>
        <Text style={title}>Country *</Text>
        <Picker selectedValue={country} onValueChange={setCountry}>
          <Picker.Item label="Select a country" value="" />
          <Picker.Item label="Rwanda" value="Rwanda" />
          <Picker.Item label="Kenya" value="Kenya" />
          <Picker.Item label="Uganda" value="Uganda" />
          <Picker.Item label="Tanzania" value="Tanzania" />
        </Picker>
        {!!errors.country && <Text style={errorText}>{errors.country}</Text>}
      </View>

      <View style={field}>
        <Text style={title}>Gender *</Text>
        {['Male', 'Female', 'Other'].map((item) => (
          <Pressable
            key={item}
            onPress={() => setGender(item)}
            style={{ marginVertical: 6 }}
          >
            <Text>{gender === item ? '🔘' : '◯'} {item}</Text>
          </Pressable>
        ))}
        {!!errors.gender && <Text style={errorText}>{errors.gender}</Text>}
      </View>

      <View style={field}>
        <Text style={title}>Hobbies</Text>
        {['Reading', 'Coding', 'Sports', 'Music'].map((item) => (
          <Pressable
            key={item}
            onPress={() => toggleHobby(item)}
            style={{ marginVertical: 6 }}
          >
            <Text>{hobbies.includes(item) ? '☑' : '□'} {item}</Text>
          </Pressable>
        ))}
      </View>

      <View style={field}>
        <Text style={title}>Notifications</Text>
        <Switch
          value={notifications}
          onValueChange={setNotifications}
        />
      </View>

      <View style={field}>
        <Text style={title}>Rating: {rating}</Text>
        <Slider
          minimumValue={0}
          maximumValue={10}
          step={1}
          value={rating}
          onValueChange={setRating}
        />
      </View>

      <View style={field}>
        <Text style={title}>Choose Date *</Text>
        <Pressable
          onPress={() => setShowCalendar((current) => !current)}
          style={{ paddingVertical: 12 }}
        >
          <Text>{date || 'Tap here to open calendar'}</Text>
        </Pressable>

        {showCalendar && (
          <Calendar
            maxDate={today}
            onDayPress={(day) => {
              setDate(day.dateString);
              setErrors((current) => ({
                ...current,
                date: undefined,
              }));
              setShowCalendar(false);
            }}
            markedDates={
              date
                ? {
                    [date]: {
                      selected: true,
                      selectedColor: '#3478f6',
                    },
                  }
                : {}
            }
          />
        )}

        {!!date && <Text>Selected Date: {date}</Text>}
        {!!errors.date && <Text style={errorText}>{errors.date}</Text>}
      </View>

      <View style={field}>
        <Text style={title}>PC Camera</Text>
        <Button title="Open PC Camera" onPress={openCamera} />

        {showCamera && (
          <View style={{ marginTop: 12 }}>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              style={{
                width: '100%',
                maxWidth: 500,
                backgroundColor: '#000',
              }}
            />
            <View style={{ marginTop: 8 }}>
              <Button title="Take Photo" onPress={takePhoto} />
            </View>
            <View style={{ marginTop: 8 }}>
              <Button title="Close Camera" onPress={closeCamera} />
            </View>
          </View>
        )}

        <canvas ref={canvasRef} style={{ display: 'none' }} />

        {!!cameraError && (
          <Text style={errorText}>{cameraError}</Text>
        )}

        {photoData && (
          <Image
            source={{ uri: photoData }}
            style={{ width: 200, height: 200, marginTop: 12 }}
          />
        )}
      </View>

      <View style={field}>
        <Text style={title}>Upload File</Text>
        <Pressable onPress={selectFile} style={{ paddingVertical: 10 }}>
          <Text>{file ? file.name : 'Choose a file'}</Text>
        </Pressable>
      </View>

      <View style={{ marginBottom: 30 }}>
        <Button title="Submit Form" onPress={handleSubmit} />
      </View>
    </ScrollView>
  );
}
